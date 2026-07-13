//using System.Text.Json;
//using System.Text.Json.Serialization;

//namespace FlowPilot.Infrastructure.Json;
//public class JsonDateTimeOffsetConverter : JsonConverter<DateTimeOffset>
//{
//    private const string Format = "yyyy-MM-ddTHH:mm:ss.fffZ"; // ISO 8601 format

//    public override DateTimeOffset Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
//    {
//        return DateTimeOffset.Parse(s: reader.GetString());
//    }

//    public override void Write(Utf8JsonWriter writer, DateTimeOffset value, JsonSerializerOptions options)
//    {
//        writer.WriteStringValue(value.ToString(Format));
//    }

//}