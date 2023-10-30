# Gas Tank Manager

This repo hosts the code for the Gas Tank Manager Safe App.


## How To Use Gas Tank
 - [Requirements](#requirements)
 - [Setup](#setup)
 - [Usage](#usage)

---

### Requirements

To demonstrate the feature, we'll use two Safes.

One will serve as a **Gas Tank**, while the other (a **Regular Safe**) will execute its transaction without requiring
signers to hold gas token to pay for the network fee. The fee will be paid from the **Gas Tank Safe**.

You'll also need a wallet that will function as the **Owner** of the **Regular Safe** and as *delegate* of the **Gas
Tank Safe**. The **delegate** will be able to request the **Gas Tank Safe** to pay for the gas on its behalf.

### Setup

1. [Create two Safes](https://safe.bootnode.dev/welcome):
   - a Safe paying for gas (**Gas Tank Safe**);
   - a Safe that won't pay for gas (**Regular Safe**).
3. Enable the GasTank Module in the **Gas Tank Safe**.
   - To do this, you can use the [GasTank Manager Safe App](https://gastank-manager.bootnode.dev/) and click "Enable
      GasTank Module".

| add Safe App                                  | Safe App view                                 |
|-----------------------------------------------|-----------------------------------------------|
| ![](https://hackmd.io/_uploads/HyoON-NG6.png) | ![](https://hackmd.io/_uploads/ry0SmWNMp.png) |

<span id="owner"></span>

3. Add the **Owner** of the **Regular Safe** as a *delegate* of the GasTank Module in the **Gas Tank Safe**.
    - This can be done through the [GasTank Manager Safe App](https://gastank-manager.bootnode.dev/) by pasting the
      owner's address in the input field and clicking "Add Delegate".
4. Transfer some ETH (or the native gas token) to the **Gas Tank Safe** to ensure it has sufficient funds to pay for the
   transactions.

### Usage

1. Access your **Regular Safe**.
2. Connect to it using the _delegated_ owner ([Setup.3](#owner)).
3. Trigger a transaction execution. For example:
    - add an owner (`0x000000000000000000000000000000000000dEaD`)
    - change confirmation policy
5. In the execution modal, choose "Gas Tank".
6. From the dropdown menu "GasTank to use", select the **Gas Tank Safe**, which should appear since the connected user
   was delegated in step 3 of the Setup process.

| Transaction Modal                                                   |
|---------------------------------------------------------------------|
| <img src="https://hackmd.io/_uploads/SkX34Z4Ga.png" height="450" /> |

6. Execute: only signatures will be required, no transactions requiring gas from the **Owner** account.

| (I) Safe's Tx                                 | (II) Gelato's Fee                             | (III) Tx Execution                            |
|-----------------------------------------------|-----------------------------------------------|-----------------------------------------------|
| ![](https://hackmd.io/_uploads/BJ-GrZ4fp.png) | ![](https://hackmd.io/_uploads/rybGBbNz6.png) | ![](https://hackmd.io/_uploads/rkWMH-EGa.png) |
