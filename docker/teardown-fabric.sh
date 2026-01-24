#!/bin/bash

# Teardown Fabric Network
echo "Tearing down Hyperledger Fabric network..."

# Stop and remove Fabric containers
docker ps -a | grep fabric | awk '{print $1}' | xargs docker stop 2>/dev/null || true
docker ps -a | grep fabric | awk '{print $1}' | xargs docker rm 2>/dev/null || true

# Remove Fabric network
docker network rm fabric-network 2>/dev/null || true

echo "Fabric network teardown complete"
