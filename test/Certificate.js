const Cert = artifacts.require("CertChain");

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
            await instance.issueCertificate(
                john_name,
                "ISTD",
                "Degree",
                2021,
                2018,
                john_addr,
                {from :sutd_addr}
            )
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
            await instance.issueCertificate(
                john_name,
                "ISTD",
                "Degree",
                2021,
                2018,
                john_addr,
                {from :sutd_addr}
            )
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })

    it("should NOT allow registered institution to issue SAME cert TWICE",async ()=>{
        const instance=await Cert.deployed();
        const reason = "This certificate is already issued."
        try{
            await instance.issueCertificate(
                john_name,
                "ISTD",
                "Degree",
                2021,
                2018,
                john_addr,
                {from :sutd_addr}
            )
        }catch(error){
            assert(error.reason==reason,"Expected error but did not get one")
        }
    })

    it("should allow anyone to verify VALID cert",async ()=>{
        const instance=await Cert.deployed();
        try{
            const isIssued=await instance.verifyCertificate(
                john_name,
                "ISTD",
                "Degree",
                sutd_name,
                2021,
                2018,
                john_addr,
                sutd_addr,{from: hr_addr})
            assert.equal(true,isIssued)
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })

    it("should allow anyone to verify INVALID cert",async ()=>{
        const instance=await Cert.deployed();
        try{
            const isIssued=await instance.verifyCertificate(
                john_name,
                "ISTD",
                "Masters", // THIS IS WRONG
                sutd_name,
                2021,
                2018,
                john_addr,
                sutd_addr,{from: hr_addr})
            assert.equal(false,isIssued)
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })

    
    it("should allow only the recipient to see all his cert correctly",async ()=>{
        const instance=await Cert.deployed();
        try{
            const allCerts=await instance.getAllMyCertificates({from:john_addr})
            assert.equal(allCerts.length,1)
            assert.deepEqual([allCerts[0].name,allCerts[0].course,allCerts[0].degree,allCerts[0].institutionName,allCerts[0].graduatingYear,allCerts[0].enrolledYear,allCerts[0].recipient,allCerts[0].issuer],
                [john_name,"ISTD","Degree", sutd_name,"2021","2018",john_addr,sutd_addr])
        }catch(error){
            assert.fail("Unexpected error received: "+error)
        }
    })
})
