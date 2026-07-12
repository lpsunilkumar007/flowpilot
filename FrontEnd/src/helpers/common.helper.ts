export class commonHelper {
	// Map of deprecated / Windows legacy timezones → correct IANA timezones
	static TIMEZONE_NORMALIZATION_MAP: Record<string, string> = {
		'Asia/Calcutta': 'Asia/Kolkata',
		'Asia/Katmandu': 'Asia/Kathmandu',
		'US/Pacific': 'America/Los_Angeles',
		'US/Eastern': 'America/New_York',
		'US/Central': 'America/Chicago',
		'US/Mountain': 'America/Denver',
		'US/Arizona': 'America/Phoenix',
		'US/Alaska': 'America/Anchorage',
		'US/Hawaii': 'Pacific/Honolulu',
	}

	/**
	 * Returns the user's current device timezone in IANA format.
	 * Includes normalization for outdated Windows zones.
	 */
	static getCurrentUserTimeZone(): string {
		if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
			return 'UTC'
		}

		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

		// Normalize old/deprecated/Windows timezone names
		if (timeZone in commonHelper.TIMEZONE_NORMALIZATION_MAP) {
			return commonHelper.TIMEZONE_NORMALIZATION_MAP[timeZone]
		}

		return timeZone
	}
}
