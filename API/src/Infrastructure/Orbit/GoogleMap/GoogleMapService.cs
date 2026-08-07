using System.Text;
using System.Text.Json;
using FlowPilot.Application.GoogleMap;
using FlowPilot.Application.GoogleMap.Request;
using FlowPilot.Application.Setting;
using FlowPilot.Domain.Enums;

namespace FlowPilot.Infrastructure.Orbit.GoogleMap;

public class GoogleMapService : IGoogleMapService
{
    private readonly HttpClient _httpClient;
    private readonly ISettingService _systemSettingService;
    public GoogleMapService(HttpClient httpClient, ISettingService systemSettingService)
    {
        _httpClient = httpClient;
        _systemSettingService = systemSettingService;
    }
    public async Task<List<DropDownStrValuePlaceResponse>> GetAddressSuggestionsAsync(string input)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(input)) return new List<DropDownStrValuePlaceResponse>();
            string fields = "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location";
            var apiKey = await _systemSettingService.GetSettingByCodeAsync<string>(SettingTypes.GoogleMapKey);
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri("https://places.googleapis.com/v1/places:searchText"),
                Headers =
                {
                    { "X-Goog-Api-Key", apiKey },
                    { "X-Goog-FieldMask", fields }
                },
                Content = new StringContent(
                    JsonSerializer.Serialize(new { textQuery = input }),
                    Encoding.UTF8,
                    "application/json"
                )
            };

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);
            var suggestions = new List<DropDownStrValuePlaceResponse>();

            if (doc.RootElement.TryGetProperty("places", out var places))
            {
                foreach (var place in places.EnumerateArray())
                {
                    var id = place.GetProperty("id").GetString();
                    var formattedAddress = place.GetProperty("formattedAddress").GetString();

                    string displayName = null;
                    if (place.TryGetProperty("displayName", out var displayNameObj) &&
                        displayNameObj.TryGetProperty("text", out var displayNameText))
                    {
                        displayName = displayNameText.GetString();
                    }

                    var text = $"{displayName}, {formattedAddress}".Trim(',', ' ');

                    // Extract city, state, zip from address_components
                    string city = null, state = null, zip = null;
                    double? lat = null, longt = null;
                    if (place.TryGetProperty("addressComponents", out var addressComponents))
                    {
                        foreach (var component in addressComponents.EnumerateArray())
                        {
                            if (!component.TryGetProperty("types", out var types)) continue;

                            foreach (var type in types.EnumerateArray())
                            {
                                var typeStr = type.GetString();
                                if (typeStr == "locality") city = component.GetProperty("longText").GetString();
                                else if (typeStr == "administrative_area_level_1") state = component.GetProperty("longText").GetString();
                                else if (typeStr == "postal_code") zip = component.GetProperty("longText").GetString();
                            }
                        }
                    }
                    if (place.TryGetProperty("location", out var location))
                    {
                        if (location.TryGetProperty("latitude", out var latValue)) lat = latValue.GetDouble();

                        if (location.TryGetProperty("longitude", out var lngValue)) longt = lngValue.GetDouble();
                    }


                    suggestions.Add(new DropDownStrValuePlaceResponse
                    {
                        Text = text,
                        Value = id,
                        City = city,
                        State = state,
                        PostalCode = zip,
                        Latitude = lat,
                        Longtitude = longt,
                    });
                }
            }

            return suggestions;
        }
        catch (Exception ex)
        {
            // Log the exception (use your logger here)
            Console.WriteLine($"Error fetching suggestions: {ex.Message}");
            return new List<DropDownStrValuePlaceResponse>();
        }

    }

}