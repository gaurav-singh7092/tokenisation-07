import React, { Component } from "react";
import MyToken from './contracts/MyToken.json';
import MyTokenSale from './contracts/MyTokenSale.json';
import KycContract from './contracts/KycContract.json'; 
// import OwnerContract from "./contracts/Owner.json"; 
import getWeb3 from "./getWeb3";

import "./styles.css";

class App extends Component { 
  state = {loaded : false, kycAddress: '0x123...', tokenSaleAddress: null, userTokens: 0};
  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
       this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      // this.itemManager = new this.web3.eth.Contract (
      //   ItemManagerContract.abi,
      //   ItemManagerContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      // )
    
      // this.item = new this.web3.eth.Contract (
      //   ItemContract.abi,
      //   ItemContract.networks[this.networkId] && ItemContract.networks[this.networkId].address,
      // )
      // this.listenToPaymentEvent();
      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );

      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      ); 
      this.listenToTokenTransfer();
      this.setState({loaded: true, tokenSaleAddress: MyTokenSale.networks[this.networkId].address}, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleBuyTokens= async() => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei('1','wei')});
  }
  // listenToPaymentEvent = () => {
  //   let self = this;
  //   this.itemManager.events.SupplyChainStep().on("data" , async function (evt) {
  //     console.log(evt);
  //     let itemObj = await self.itemManager.methods.items(evt.returnValues._itemIndex).call();
  //     alert("Item " + itemObj._identifier + " was paid successfully, deliver it now!");
  //   })
  // }
  updateUserTokens = async () => {
     let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
     this.setState({ userTokens: userTokens});
  }
  handleKycWhiteListing = async () => {
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
    alert('KYC for ' + this.state.kycAddress+ ' is Completed !');

  }

  listenToTokenTransfer = async () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on('data', this.updateUserTokens); 
  }
  // handleSubmit = async() => {
  //   const {cost, itemName} = this.state;
  //   console.log(cost,itemName, this.itemManager);
  //   let result = await this.itemManager.methods.createItem(itemName, cost).send({from : this.accounts[0]}); 
  //   console.log(result);
  //   alert("Send"+cost+" Wei to "+result.events.SupplyChainStep.returnValues._itemAddress);
  // }


  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>StarDucks Cappucino Token Sale</h1>
        <p>Get your Token today!</p>
        <h2>Kyc Whitelisting</h2>
        Address to allow : <input type='text' name='kycAddress' value = {this.state.kycAddress} onChange = {this.handleInputChange}/>
        <button type = 'button' onClick = {this.handleKycWhiteListing}>Add to whitelist</button>
        <h2>Buy Tokens</h2>
        <p>If you want to but tokens,send Wei to this address: {this.state.tokenSaleAddress}</p>
        <p>You currently have : {this.state.userTokens} CAPPU Tokens</p>
        <button type = 'button' onClick = {this.handleBuyTokens}>Buy more tokens</button>
      </div>
    );
  }
} 

export default App;
