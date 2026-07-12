// useSignalR.ts
import { useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import config from '../config'
import { APICore } from '@/helpers/api/apiCore'
export const useSignalR = () => {
	const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
	const [isConnected, setIsConnected] = useState(false)
	const apiCore = new APICore()
	useEffect(() => {
		const hubUrl = config.API_URL! + '/notifications?access_token=' + apiCore.getLoggedInUser().token
		const conn = new signalR.HubConnectionBuilder().withUrl(hubUrl).withAutomaticReconnect().build()

		setConnection(conn)

		return () => {
			conn.stop()
		}
	}, [])

	useEffect(() => {
		if (!connection) return

		connection
			.start()
			.then(() => setIsConnected(true))
			.catch((err) => console.error('SignalR start error', err))

		return () => {
			connection.stop()
		}
	}, [connection])

	return { connection, isConnected }
}
