using FlowPilot.Application.Common.Exceptions;
using FlowPilot.Application.Common.Extensions;
using FlowPilot.Application.Common.FileStorage;
using FlowPilot.Domain.Enums;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

namespace FlowPilot.Infrastructure.FileStorage;

public class LocalFileStorageService : IFileStorageService
{
    private string Root => Directory.GetCurrentDirectory();

    private static readonly Regex Base64PrefixRegex = new(@"^data:(.*?);base64,", RegexOptions.Compiled);

    private string GetFolderPath<T>(FileType fileType)
        where T : class
    {
        string folderName = typeof(T).Name;

        if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            folderName = folderName.Replace(@"\", "/");

        string folder = fileType switch
        {
            FileType.Image => Path.Combine("Files", "Images", folderName),
            _ => Path.Combine("Files", "Others", folderName),
        };

        string fullPath = Path.Combine(Root, folder);
        Directory.CreateDirectory(fullPath);

        return fullPath;
    }

    // --------------------------------------
    // ?? Helper: clean base64 string
    // --------------------------------------
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

    // --------------------------------------
    // ?? Helper: save file
    // --------------------------------------
    private async Task<string> SaveFileAsync(string fullFolderPath, string fileName, byte[] fileBytes)
    {
        Directory.CreateDirectory(fullFolderPath);

        string fullPath = Path.Combine(fullFolderPath, fileName);

        if (File.Exists(fullPath))
            fullPath = NextAvailableFilename(fullPath);

        await File.WriteAllBytesAsync(fullPath, fileBytes);

        // Convert absolute ? relative for DB
        string relativePath = fullPath.Replace(Root, string.Empty)
                                      .TrimStart(Path.DirectorySeparatorChar)
                                      .Replace("\\", "/");

        return relativePath;
    }

    // --------------------------------------
    // ?? Upload generic
    // --------------------------------------
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

        string folderPath = GetFolderPath<T>(supportedFileType);
        string safeName = RemoveSpecialCharacters(request.Name).ReplaceWhitespace("-");
        string fileName = safeName + request.Extension;

        return await SaveFileAsync(folderPath, fileName, fileBytes);
    }


    // --------------------------------------
    public static string RemoveSpecialCharacters(string str)
        => Regex.Replace(str, "[^a-zA-Z0-9_.]+", string.Empty, RegexOptions.Compiled);

    public void Remove(string? path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return;

        string fullPath = Path.Combine(Root, path);

        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    // Handles duplicate filenames
    private static string NextAvailableFilename(string path)
    {
        if (!File.Exists(path))
            return path;

        string directory = Path.GetDirectoryName(path)!;
        string filename = Path.GetFileNameWithoutExtension(path);
        string extension = Path.GetExtension(path);

        int counter = 1;
        string newPath;

        do
        {
            newPath = Path.Combine(directory, $"{filename}-{counter}{extension}");
            counter++;
        }
        while (File.Exists(newPath));

        return newPath;
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

    public string FileToBase64String(string path)
    {
        string full = Path.Combine(Root, path);

        if (File.Exists(full))
            return Convert.ToBase64String(File.ReadAllBytes(full));

        return string.Empty;
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
        string full = Path.Combine(Root, filePath);

        if (!File.Exists(full))
            throw new FileNotFoundException($"File not found: {full}");

        return new DownloadFileResponse
        {
            FileBase64String = FileToBase64String(filePath),
            Extension = Path.GetExtension(full)?.TrimStart('.') ?? "unknown",
            Name = Path.GetFileNameWithoutExtension(full)
        };
    }
}
