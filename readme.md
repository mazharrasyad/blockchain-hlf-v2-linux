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

5. Pertama menjalankan networknya
```
cd fabric-samples/test-network
./network.sh down
./network.sh up
```

6. Kedua membuat channelnya
```
./network.sh createChannel
```