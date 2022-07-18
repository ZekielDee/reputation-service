/* istanbul ignore file */
import { ContractName } from "src/config"
import { getBackendContractInstance } from "src/utils/backend"
import { getContractAddress, getContractEvents } from "src/utils/common"

export default async function retrieveEvents(eventName: string): Promise<any[]> {
    const contractAddress = getContractAddress(ContractName.INTEREP)
    const contractInstance = await getBackendContractInstance(ContractName.INTEREP, contractAddress)
    const events: any = await getContractEvents(contractInstance, eventName)
    return events.map((event: any) => event.args)
}
