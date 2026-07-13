using System.Text.RegularExpressions;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Extensions;
using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Domain.Enums;
using Microsoft.Extensions.Options;

namespace FlowPilot.Infrastructure.FileStorage;

public class AwsFileStorageService : IFileStorageService
{
    private readonly AmazonS3Settings _amazonS3Settings;
    private readonly IAmazonS3 _s3;

    private static readonly Regex Base64PrefixRegex = new(@"^data:(.*?);base64,", RegexOptions.Compiled);

    public AwsFileStorageService(IOptions<AmazonS3Settings> amazonS3Settings)
    {
        _amazonS3Settings = amazonS3Settings.Value;
        var region = RegionEndpoint.GetBySystemName(_amazonS3Settings.Region);
        _s3 = new AmazonS3Client(_amazonS3Settings.AwsAccessKeyId, _amazonS3Settings.AwsSecretAccessKey, region);
    }

    // -----------------------------
    // S3 "folder" (key prefix)
    // -----------------------------
    private static string GetKeyPrefix<T>(FileType fileType) where T : class
    {
        var folderName = typeof(T).Name;

        // keep same path style regardless of OS
        var prefix = fileType switch
        {
            FileType.Image => $"Files/Images/{folderName}",
            _ => $"Files/Others/{folderName}"
        };

        return prefix.Trim('/');
    }

    private static string BuildObjectKey(string prefix, string fileName)
        => $"{prefix}/{fileName}".Replace("\\", "/").Trim('/');

    // -----------------------------
    // base64 helpers (keep yours)
    // -----------------------------
    private static string CleanBase64(string base64)
    {
        if (string.IsNullOrWhiteSpace(base64))
            throw new InvalidOperationException("Invalid base64 string.");

        base64 = Base64PrefixRegex.Replace(base64, string.Empty)
            .Replace(" ", string.Empty)
            .Replace("\n", string.Empty)
            .Replace("\r", string.Empty)
            .Trim();

        if (base64.Contains(","))
            base64 = base64[(base64.IndexOf(',') + 1)..];

        return base64;
    }

    public static string RemoveSpecialCharacters(string str)
        => Regex.Replace(str, "[^a-zA-Z0-9_.]+", string.Empty, RegexOptions.Compiled);

    // -----------------------------
    // Upload to S3
    // -----------------------------
    private async Task<string> UploadToS3Async(string objectKey, byte[] bytes, string? contentType, CancellationToken ct)
    {
        using var ms = new MemoryStream(bytes);

        var put = new PutObjectRequest
        {
            BucketName = _amazonS3Settings.DefaultBucketName,
            Key = objectKey,
            InputStream = ms,
            AutoCloseStream = false,
            ContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType
        };

        await _s3.PutObjectAsync(put, ct);

        // Return URL or key (your choice)
        if (!string.IsNullOrWhiteSpace(_amazonS3Settings.PublicBaseUrl))
            return $"{_amazonS3Settings.PublicBaseUrl.TrimEnd('/')}/{objectKey}";

        return objectKey;
    }

    public async Task<string> UploadAsync<T>(FileUploadRequest? request, FileType supportedFileType, CancellationToken cancellationToken = default)
        where T : class
    {
        if (request == null || request.Data == null)
            return string.Empty;

        if (request.Extension == null || !supportedFileType.GetDescriptionList().Contains(request.Extension.ToLower()))
            throw new InvalidOperationException("File Format Not Supported.");

        if (string.IsNullOrEmpty(request.Name))
            throw new InvalidOperationException("Name is required.");

        string cleanBase64 = supportedFileType == FileType.Image
            ? Regex.Match(request.Data, "data:image/(?<type>.+?),(?<data>.+)").Groups["data"].Value
            : CleanBase64(request.Data);

        byte[] fileBytes = Convert.FromBase64String(cleanBase64);

        if (fileBytes.Length == 0)
            return string.Empty;

        var safeName = RemoveSpecialCharacters(request.Name).ReplaceWhitespace("-");
        var fileName = safeName + request.Extension; // keep same naming behaviour

        var prefix = GetKeyPrefix<T>(supportedFileType);
        var key = BuildObjectKey(prefix, fileName);

        var contentType = supportedFileType == FileType.Image
            ? $"image/{request.Extension.TrimStart('.')}"
            : "application/octet-stream";

        return await UploadToS3Async(key, fileBytes, contentType, cancellationToken);
    }

    // -----------------------------
    // Delete from S3
    // -----------------------------
    public void Remove(string? path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return;

        // if caller stored full URL, extract key
        var key = ExtractKey(path);

        _s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _amazonS3Settings.DefaultBucketName,
            Key = key
        }).GetAwaiter().GetResult();
    }

    private string ExtractKey(string pathOrUrl)
    {
        // If it's a URL like https://bucket.s3.../Files/Images/X/y.jpg => take the path part
        if (Uri.TryCreate(pathOrUrl, UriKind.Absolute, out var uri))
            return uri.AbsolutePath.TrimStart('/');

        return pathOrUrl.TrimStart('/');
    }

    // -----------------------------
    // Download / read (base64)
    // -----------------------------
    public string FileToBase64String(string path)
    {
        var key = ExtractKey(path);

        var resp = _s3.GetObjectAsync(_amazonS3Settings.DefaultBucketName, key)
                      .GetAwaiter().GetResult();

        using var ms = new MemoryStream();
        resp.ResponseStream.CopyTo(ms);
        return Convert.ToBase64String(ms.ToArray());
    }

    public byte[] Base64StringToFile(string base64String)
    {
        string clean = CleanBase64(base64String);

        try
        {
            return Convert.FromBase64String(clean);
        }
        catch
        {
            throw new BadRequestException("Invalid base64 string format");
        }
    }

    public DownloadFileResponse GetFileFromPath(string filePath)
    {
        var key = ExtractKey(filePath);

        // get object
        var resp = _s3.GetObjectAsync(_amazonS3Settings.DefaultBucketName, key)
                      .GetAwaiter().GetResult();

        var extension = Path.GetExtension(key)?.TrimStart('.') ?? "unknown";
        var name = Path.GetFileNameWithoutExtension(key);

        using var ms = new MemoryStream();
        resp.ResponseStream.CopyTo(ms);

        return new DownloadFileResponse
        {
            FileBase64String = Convert.ToBase64String(ms.ToArray()),
            Extension = extension,
            Name = name
        };
    }
    
    public bool ValidateFiles(List<FileUploadRequest> requests, FileType supportedFileType)
    {
        foreach (var req in requests)
        {
            if (string.IsNullOrEmpty(req.Data))
                throw new InvalidOperationException($"No file uploaded: {req.Name}");

            if (req.Extension == null || !supportedFileType.GetDescriptionList().Contains(req.Extension.ToLower()))
                throw new InvalidOperationException($"File Format Not Supported for {req.Name}");

            if (string.IsNullOrEmpty(req.Name))
                throw new InvalidOperationException("Name is required.");
        }
        return true;
    }
}
