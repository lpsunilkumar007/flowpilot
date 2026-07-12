import moment from 'moment'

export class formatHelper {
	static DateFormat = (value: Date) => {
		return moment(value).format('DD-MMM-YYYY')
	}

	static DateTimeFormat = (value: Date) => {
		return moment(value).format('DD-MMM-YYYY HH:mm a')
	}
	static MomentDateTimeFormat = (value: moment.Moment) => {
		return value.format('DD-MMM-YYYY HH:mm a')
	}
	static MomentDateFormat = (value: moment.Moment | string | Date) => {
		return moment(value).format('DD-MMM-YYYY')
	}

	static punctuateLabel(label: string): string {
		try {
			const spacedLabel = label.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
			return spacedLabel.charAt(0).toUpperCase() + spacedLabel.slice(1)
		} catch (error) {
			console.error('Error in punctuateLabel:', error)
			return label || ''
		}
	}
	static MomentDateKey = (value: moment.Moment) => {
		return value.format('DD-MMM-YYYY')
	}

	static MomentTimeKey = (value: moment.Moment) => {
		return value.format('HH:mm')
	}
}
