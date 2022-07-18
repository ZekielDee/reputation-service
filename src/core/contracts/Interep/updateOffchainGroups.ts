/* istanbul ignore file */
import { ContractReceipt, utils } from "ethers"
import config, { ContractName } from "src/config"
import { GroupName, Provider } from "src/types/groups"
import { getBackendContractInstance } from "src/utils/backend"
import { getContractAddress } from "src/utils/common"

export default async function updateOffchainGroups(
    providers: Provider[],
    names: GroupName[],
    roots: string[]
): Promise<ContractReceipt> {
    const contractAddress = getContractAddress(ContractName.INTEREP)
    const contractInstance = await getBackendContractInstance(ContractName.INTEREP, contractAddress)

    const groups = []

    for (let i = 0; i < providers.length; i++) {
        groups.push({
            provider: utils.formatBytes32String(providers[i]),
            name: utils.formatBytes32String(names[i]),
            depth: config.MERKLE_TREE_DEPTH,
            root: roots[i]
        })
    }

    // const txOptions = { gasLimit: 2100000, gasPrice: 8000000000}
    const transaction = await contractInstance.updateGroups(groups)
    // const transaction = await contractInstance.updateGroups(groups, txOptions)
    console.log("UPDATED OFFCHAIN GROUPS")

    return transaction.wait(1)
}
