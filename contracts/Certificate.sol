// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;
import "./Ownable.sol";
/** 
 * @title CertChain
 * @dev Storage of certificate and publishing only from registered institution
 */

contract CertChain is Ownable{
    struct Certificate {
        string name;
        string course;
        string degree;
        string institutionName;
        uint graduatingYear;
        uint enrolledYear;
        address recipient;
        address issuer;
    }
    
    mapping(address=>bool) public registeredInstitution;
    mapping(address=>string) public instAddrToName;
    mapping(bytes32=>address) public certChain; // cerificateHash => recipient's address
    mapping(bytes32=>bool) public issuedCertificateHash;
    mapping(address=> Certificate[]) private storageCert;
    
    
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
        string memory _name,
        string memory _course,
        string memory _degree,
        uint _graduatingYear,
        uint _enrolledYear,
        address _recipient
    ) public{
        require(registeredInstitution[msg.sender]==true,"This institution address is not registered.");
        
        string memory institutionName = instAddrToName[msg.sender];
        Certificate memory cert;
        cert.name = _name;
        cert.course = _course;
        cert.degree = _degree;
        cert.institutionName = institutionName;
        cert.graduatingYear = _graduatingYear;
        cert.enrolledYear = _enrolledYear;
        cert.recipient = _recipient;
        cert.issuer = msg.sender;
        
        bytes32 certhash = bytes32(keccak256(abi.encodePacked(_name, _course,_degree, institutionName, _graduatingYear,_enrolledYear, _recipient, msg.sender)));    
        require(issuedCertificateHash[certhash]==false,"This certificate is already issued.");
        
        certChain[certhash]=_recipient;
        issuedCertificateHash[certhash]=true;
        storageCert[_recipient].push(cert);
    }
    
    function verifyCertificate(
        string memory _name,
        string memory _course,
        string memory _degree,
        string memory _institutionName,
        uint _graduatingYear,
        uint _enrolledYear,
        address _recipient,
        address _sender
    ) view public returns (bool){
        bytes32 certhash = bytes32(keccak256(abi.encodePacked(_name,_course,_degree,_institutionName,_graduatingYear,_enrolledYear,_recipient,_sender)));    
        return certChain[certhash]==_recipient;
    }

    
    function getAllMyCertificates() public view returns (Certificate[] memory){
        return storageCert[msg.sender];
    }

}
   





   
