using FlowPilot.Application.GoogleMap.Request;

namespace FlowPilot.Application.GoogleMap;

public interface IGoogleMapService : ITransientService
{
    Task<List<DropDownStrValuePlaceResponse>> GetAddressSuggestionsAsync(string input);
}
