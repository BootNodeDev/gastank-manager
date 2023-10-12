import {ConnectKitButton} from '../components/ConnectKitButton'
import {Connected} from '../components/Connected'
import {GasTankModule} from "../components/GasTankModule";
import {SafeWrapper} from "../components/SafeWrapper";

export default function Page() {
  return (
    <>
      <h1>GasTank Module</h1>

      <ConnectKitButton />

      <Connected>
        <SafeWrapper>
          <GasTankModule />
        </SafeWrapper>
      </Connected>
    </>
  )
}
