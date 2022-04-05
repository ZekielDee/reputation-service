import {
    Box,
    Button,
    Container,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Skeleton,
    Spinner,
    Text,
    useDisclosure,
    VStack
} from "@chakra-ui/react"
import { OAuthProvider } from "@interep/reputation"
import { Step, Steps, useSteps } from "chakra-ui-steps"
import { GetServerSideProps } from "next"
import { signIn as _signIn } from "next-auth/client"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { IconType } from "react-icons"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { GoSearch } from "react-icons/go"
import { AlertDialog } from "src/components/alert-dialog"
import { GroupBox, GroupBoxButton, GroupBoxHeader, GroupBoxOAuthContent } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { Group } from "src/types/groups"
import { capitalize } from "src/utils/common"
import { groupBy } from "src/utils/frontend"

const oAuthIcons: Record<string, IconType> = {
    twitter: FaTwitter,
    github: FaGithub,
    reddit: FaRedditAlien
}

export default function OAuthProvidersPage(): JSX.Element {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { activeStep, setStep } = useSteps({
        initialStep: 0
    })
    const { _account } = useContext(EthereumWalletContext)
    const [_oAuthProvider, setOAuthProvider] = useState<string>()
    const [_oAuthProviders, setOAuthProviders] = useState<[string, Group[]][]>()
    const [_searchValue, setSearchValue] = useState<string>("")
    const [_sortingValue, setSortingValue] = useState<string>("1")
    const { getGroups } = useGroups()

    useEffect(() => {
        ;(async () => {
            const groups = await getGroups()

            if (groups) {
                setOAuthProviders(groupBy(groups, "provider", Object.values(OAuthProvider)))
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!_account) {
            setStep(0)
        } else {
            setStep(1)
        }
    }, [_account, setStep])

    function getTotalGroupSizes(provider: any): number {
        const groups: Group[] = provider[1]

        return groups.reduce((t, c) => t + c.size, 0)
    }

    const sortCb = useCallback(
        (oAuthProviderA: any, oAuthProviderB: any) => {
            switch (_sortingValue) {
                case "2":
                    return oAuthProviderA[0].localeCompare(oAuthProviderB.title)
                case "3":
                    return oAuthProviderA[0].localeCompare(oAuthProviderA.title)
                case "1":
                default:
                    return getTotalGroupSizes(oAuthProviderB) - getTotalGroupSizes(oAuthProviderA)
            }
        },
        [_sortingValue]
    )

    const filterCb = useCallback(
        (oAuthProvider: any) => {
            const name = oAuthProvider[0]

            return !_searchValue || name.includes(_searchValue.toLowerCase())
        },
        [_searchValue]
    )

    function selectOAuthProvider(oAuthProvider: string) {
        setOAuthProvider(oAuthProvider)
        onOpen()
    }

    const signIn = useCallback(() => {
        if (_oAuthProvider) {
            _signIn(_oAuthProvider)
            onClose()
        }
    }, [_oAuthProvider, onClose])

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.xl">
            <HStack mb="6" spacing="6">
                <VStack align="left">
                    <Heading as="h3" size="lg" mb="2">
                        Authenticate anonymously on-chain using off-chain reputation
                    </Heading>

                    <Text color="background.400" fontSize="md">
                        To join Social network groups you will need to authorize each provider individually to share
                        your credentials with Interep. Groups can be left at any time.
                    </Text>
                </VStack>
                <Box bg="background.800" borderRadius="4px" h="180" w="700px" />
            </HStack>

            <Steps activeStep={activeStep} colorScheme="background" size="sm" py="4">
                <Step label="Connect wallet" />
                <Step label="Authorize provider" />
                <Step label="Generate Semaphore ID" />
                <Step label="Join social network group" />
            </Steps>

            {!_oAuthProviders ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : (
                <>
                    <HStack justify="space-between" my="6">
                        <InputGroup maxWidth="250px">
                            <InputLeftElement pointerEvents="none">
                                <GoSearch color="gray" />
                            </InputLeftElement>
                            <Input
                                colorScheme="primary"
                                placeholder="Search"
                                value={_searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                            />
                        </InputGroup>

                        <Select
                            value={_sortingValue}
                            onChange={(event) => setSortingValue(event.target.value)}
                            maxWidth="250px"
                        >
                            <option value="1">Most members</option>
                            <option value="2">A-Z</option>
                            <option value="3">Z-A</option>
                        </Select>
                    </HStack>

                    {_oAuthProviders ? (
                        <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                            {_oAuthProviders
                                .sort(sortCb)
                                .filter(filterCb)
                                .map((p, i) => (
                                    <GroupBox key={i.toString()}>
                                        <GroupBoxHeader title={capitalize(p[0])} icon={oAuthIcons[p[0]]} />
                                        <GroupBoxOAuthContent icon={oAuthIcons[p[0]]} groups={p[1]} />
                                        <GroupBoxButton onClick={() => selectOAuthProvider(p[0])} disabled={!_account}>
                                            Authorize
                                        </GroupBoxButton>
                                    </GroupBox>
                                ))}
                        </SimpleGrid>
                    ) : (
                        <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                            {Object.values(oAuthIcons).map((_p, i) => (
                                <Skeleton
                                    key={i.toString()}
                                    startColor="background.800"
                                    endColor="background.700"
                                    borderRadius="4px"
                                    height="318px"
                                />
                            ))}
                        </SimpleGrid>
                    )}

                    {_oAuthProvider && (
                        <AlertDialog
                            title="Authorize Interep to connect?"
                            message={`Interep wants to connect with the last ${capitalize(
                                _oAuthProvider
                            )} account you logged into. Approving this message will open a new window.`}
                            isOpen={isOpen}
                            onClose={onClose}
                            actions={
                                <Button colorScheme="primary" isFullWidth onClick={() => signIn()}>
                                    Approve
                                </Button>
                            }
                        />
                    )}
                </>
            )}
        </Container>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const authorized = !!req.cookies["__Secure-next-auth.session-token"] || !!req.cookies["next-auth.session-token"]

    if (!authorized) {
        return {
            props: {}
        }
    }

    return {
        redirect: {
            destination: "/oauth",
            permanent: false
        }
    }
}
