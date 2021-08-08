// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
import "./Ownable.sol";
/** 
 * @title CertChain
 * @dev Storage of certificate and publishing only from registered institution
 */

contract CertChain is Ownable{
    
    mapping(address=>bool) public registeredInstitution;
    mapping(address=>string) public instAddrToName;
    mapping(bytes32=>address) public certChain; // cerificateHash => recipient's address
    mapping(bytes32=>bool) public issuedCertificateHash;
    
    /* Institution */
    function registerInstitution(address _institutionAddr, string memory _name) public onlyOwner returns (string memory){
        require(registeredInstitution[_institutionAddr]==false, "This address is already registered.");
        registeredInstitution[_institutionAddr]=true;
        instAddrToName[_institutionAddr]=_name;
        return "success";
    }
    
    function getInstitutionName(address _institutionAddr) public view returns (string memory){
        require(registeredInstitution[_institutionAddr]==true, "There is no such address registered.");
        return instAddrToName[_institutionAddr];
    }
    
    /* Certificate */
    function issueCertificate(
        bytes32 certhash,
        address _recipient
    ) public returns (bool){
        require(registeredInstitution[msg.sender]==true,"This institution address is not registered.");
        
        require(issuedCertificateHash[certhash]==false,"This certificate is already issued.");
        
        certChain[certhash]=_recipient;
        issuedCertificateHash[certhash]=true;
        return true;
    }
    
    function verifyCertificate(
        bytes32 certhash,
        address _recipient
    ) view public returns (bool){
        return certChain[certhash]==_recipient;
    }
}
