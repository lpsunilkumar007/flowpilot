import avatar from '@/assets/images/users/avatar-11.png'
export class imageHelper {
	static getUserImage = (value?: string) => {
		if (!value || value.trim() === '') {
			return avatar
		}
		return `data:image/png;base64,${value}`
	}
}
