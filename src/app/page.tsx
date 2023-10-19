'use client'

import {Box, Container, Heading, Spacer, Stack} from "@chakra-ui/react";

import {ConnectKitButton} from '../components/ConnectKitButton'
import {Connected} from '../components/Connected'
import {GasTankModule} from "../components/GasTankModule";
import {SafeWrapper} from "../components/SafeWrapper";

export default function Page() {
  return (
    <Container maxW="container.md">
      <Stack direction="column" spacing='12px'>
        <Box margin='12px'>
          <Stack direction={['column', 'row']} spacing='12px'>
            <Heading>Manage GasTank Module for</Heading>
            <Spacer />
            <ConnectKitButton />
          </Stack>
        </Box>
        <Connected>
          <SafeWrapper>
            <GasTankModule />
          </SafeWrapper>
        </Connected>
      </Stack>
    </Container>
  )
}
