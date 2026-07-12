namespace FlowPilot.Application.ExternalIntegrations.Jitsi.Models.Response;
public class JitsiInterfaceConfigOverwriteResponse
{


    //[JsonProperty("DISABLE_JOIN_LEAVE_NOTIFICATIONS")]
    public bool DISABLE_JOIN_LEAVE_NOTIFICATIONS { get; set; } = false;

    //[JsonProperty("SHOW_JITSI_WATERMARK")]
    public bool SHOW_JITSI_WATERMARK { get; set; } = false;


    //[JsonProperty("SHOW_BRAND_WATERMARK")]
    public bool SHOW_BRAND_WATERMARK { get; set; } = false;


    //[JsonProperty("SHOW_WATERMARK_FOR_GUESTS")]
    public bool SHOW_WATERMARK_FOR_GUESTS { get; set; } = false;


    //[JsonProperty("SHOW_POWERED_BY")]
    public bool SHOW_POWERED_BY { get; set; } = false;



    //[JsonProperty("BRAND_WATERMARK_LINK ")]
    public string BRAND_WATERMARK_LINK { get; set; } = "";


    // [JsonProperty("MOBILE_APP_PROMO")]
    public bool MOBILE_APP_PROMO { get; set; } = false;

    //[JsonProperty("DISABLE_DEEP_LINK")]
    public bool DISABLE_DEEP_LINK { get; set; } = true;


    //[JsonProperty("GENERATE_ROOMNAMES_ON_WELCOME_PAGE")]
    public bool GENERATE_ROOMNAMES_ON_WELCOME_PAGE { get; set; } = false;


}
