# Blockchain dengan framework Hyperledger Fabric v2.5 untuk Linux

1. Panduannya dari web hyperledger fabric
```
https://hyperledger-fabric.readthedocs.io/en/release-2.5/install.html
```

2. Install dengan script berikut
```
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
```

3. Untuk awalan menggunakan samples terlebih dahulu (versi 2.5.14)
```
./install-fabric.sh docker samples binary
```

4. Selanjutnya test menyalakan network bisa dilihat panduannya
```
https://hyperledger-fabric.readthedocs.io/en/release-2.5/test_network.html
```

5. Pertama, masuk ke dalam direktori network blockchainnya
```
cd fabric-samples/test-network
```

6. Kedua, menjalankan network dan membuat channel, pastikan tidak ada network lain yang jalan
```
./network.sh down
./network.sh up createChannel
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go
```

- Opsi jika error sudah ada channel yang ada maka hapus dulu docker yang ada
```
docker rm -f $(docker ps -aq)
docker volume prune -f
docker volume rm $(docker volume ls -q)
```

7. Ketiga, atur pathnya dulu agar dapat melihat isi jaringan blockchain
```
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

8. Terakhir cek test network blockchainnya
```
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'
```

- Cek isi jaringan blockchainnya
```
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}' | jq
```