const Cert = artifacts.require("CertChain");
const { soliditySha3 } = require("web3-utils");

contract("CertChain test",async accounts => {
    const authority_addr=accounts[0] //by default, accounts[0] is the address that deployed the contract
    const sutd_addr=accounts[1]
    const sutd_name="SUTD"
    const john_addr=accounts[2]
    const john_name="John"
    const hr_addr=accounts[3]

    it("should NOT allow an unregistered institution to issue cert", async()=>{
        const instance=await Cert.deployed();
        const reason="This institution address is not registered."
        try{
            var certhash =soliditySha3(
                john_name,
                "ISTD",
                "Degree",
                sutd_name,
                2021,
                2018,
                john_addr,
                sutd_addr
            )
            await instance.issueCertificate(certhash, john_addr,{from :sutd_addr})
        }catch(error){
            // console.log(error.reason)
            assert(error.reason==reason,"Expected error but did not get one")
        }
    })

    it("NOT owner should NOT be able to register an institution",async ()=>{
        const instance=await Cert.deployed();
        try{
            await instance.registerInstitution(sutd_addr, sutd_name,{from:sutd_addr})
        }catch(error){
            assert(error,"Expected error but did not get one")
        }
    })

    it("is owner should be able to register an institution",async ()=>{
        const instance=await Cert.deployed();
        try{
            await instance.registerInstitution(sutd_addr, sutd_name,{from:authority_addr}) 
            const getinsname= await instance.getInstitutionName(sutd_addr)
            assert.equal(sutd_name,getinsname)
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })

    it("should allow registered institution to issue cert",async ()=>{
        const instance=await Cert.deployed();
        try{
            var certhash =soliditySha3(
                john_name,
                "ISTD",
                "Degree",
                sutd_name,
                2021,
                2018,
                john_addr,
                sutd_addr
            )
            await instance.issueCertificate(certhash, john_addr,{from :sutd_addr})
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })

    it("should NOT allow registered institution to issue SAME cert TWICE",async ()=>{
        const instance=await Cert.deployed();
        const reason = "This certificate is already issued."
        try{
            var certhash =soliditySha3(
                john_name,
                "ISTD",
                "Degree",
                sutd_name,
                2021,
                2018,
                john_addr,
                sutd_addr
            )
            await instance.issueCertificate(certhash, john_addr,{from :sutd_addr})
        }catch(error){
            assert(error.reason==reason,"Expected error but did not get one")
        }
    })

    it("should allow anyone to verify VALID cert",async ()=>{
        const instance=await Cert.deployed();
        try{
            var validcerthash =soliditySha3(
                john_name,
                "ISTD",
                "Degree",
                sutd_name,
                2021,
                2018,
                john_addr,
                sutd_addr
            )
            const isIssued=await instance.verifyCertificate(validcerthash,john_addr,{from: hr_addr})
            assert.equal(true,isIssued)
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })

    it("should allow anyone to verify INVALID cert",async ()=>{
        const instance=await Cert.deployed();
        try{
            var invalidcerthash =soliditySha3(
                john_name,
                "EPD", // WRONG info
                "Degree",
                sutd_name,
                2021,
                2018,
                john_addr,
                sutd_addr
            )
            const isIssued=await instance.verifyCertificate(invalidcerthash,john_addr,{from: hr_addr})
            assert.equal(false,isIssued)
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })
})
