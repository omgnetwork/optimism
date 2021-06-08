# omgx_optimism2aws

Directory hosting different devops automations, cloudformation templates and other
AWS related resources for deploying omgx_optimism integration to AWS ECS

## How to use the automation hosted here?

1. Make sure you've created a tag or a branch with your service changes for each of the services in the stack:
  * [batch-submitter](https://github.com/omgnetwork/omgx_batch-submitter)
  * [deployer](https://github.com/omgnetwork/omgx_contracts)
  * [data-transport-layer](https://github.com/omgnetwork/omgx_data-transport-layer)
  * [go-ethereum](https://github.com/omgnetwork/go-ethereum)
  * [optimism-scanner](https://github.com/enyalabs/optimism-scanner)
  * [message-relayer](https://github.com/omgnetwork/omgx_ts-services)

_Note - this information is important for now, but going forward the repos will all live inside the monorepo - e.g. the batch-submitter will be the optimism/packages/batch-submitter etc. (CP)_

2. Make sure you've got your secrets already imported in AWS, either by adding them manually or by using the `aws-secrets-importer.py` script hosted in this repository. The `aws-secrets-importer.py` can be used the following way, which would read a particular yaml file and import the secrets from it in AWS Secret Manager.

**You must name the secrets with your tag/branch name, which will be used to deploy the containers to AWS. If your secrets are already in AWS, you can skip this step**

_This is unclear - please give an example of what you mean by naming the secrets with the tag/branch. If the tag/branch name is `foo`, then what specifically needs to be named `foo`? (CP)_

Here is an example of how to run the `aws-secrets-importer.py`: 

```
$ ./aws-secrets-importer.py -i docker-compose-local.env.yml -d `echo "$(git rev-parse --abbrev-ref HEAD)"` -n `echo $(git rev-parse --abbrev-ref HEAD)` -r us-east-1 -p default
{
    "ARN": "arn:aws:secretsmanager:us-east-1:942431445534:secret:push2aws-lAl7Pu",
    "Name": "push2aws",
    "VersionId": "5848d972-98ba-4b97-8b0c-e04db2560613"
}
```

3. Make sure you have installed [jq](https://stedolan.github.io/jq/) and configured [awscli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

## Disaster Recovery and Restart Considerations

Assuming you have been running a production system, the information needed to recover the L2 to its last known good state are:

* The Ethereum L1
* The *addresses* of the L1 smart contracts
* The private keys of the *sequencer*, *address-manager*, *deployer*, *relayer* and potentially other accounts
* The *state-dump.latest.json*
* ?????????????
* ?????????????

Restart special settings and considerations:

Since the smart contracts have already all been deployed, you do not want the deployer to redeploy the smart contracts. This is controlled through the ???? setting in the deployer configuration. You just want the deployer to serve the correct addresses and state dumps.

While the L2 is syncing with the L1, the batch submitter will hold off on submitting new batches, so the system will be effectively unresponsive for however long the resync takes. The resyncing is controlled through the `DATA_TRANSPORT_LAYER__SYNC_FROM_L1=true` setting in the L2 geth configuration.

## Critical databases and folders

* Geth DATADIR=/root/.ethereum ELABORATE
* DATA_TRANSPORT_LAYER__DB_PATH=/db ELABORATE

## Deployment: how to use the key cfn-devenv.sh script

Use the `cfn-devenv.sh` to provision, update, destroy or reset your own development environment using AWS ECS

* Before provisioning the services, make sure their containers exist, choose a tag from which to pull from hub.docker.com and push to AWS ECR. The example below will pull all services with tag `latest` from the omgx hub.docker.com and push to AWS the
same container, but with the tag would be `aws-latest`. So if your original tag is `foo`, then the final tag will be `aws-foo`.

```
./cfn-devenv.sh push2aws --region us-east-1 --deploy-tag aws-latest --from-tag latest --registry-prefix omgx
```

To generate new AWS container for only one service, you can specifiy the service name and then execute:

```
./cfn-devenv.sh push2aws --region us-east-1 --deploy-tag aws-latest --from-tag latest --registry-prefix omgx --service-name deployer
```

* Once we're sure all the containers have been pushed to AWS, we can provision the whole stack with:

```
./cfn-devenv.sh create --stack-name test-stack --region us-east-1 --deploy-tag aws-latest
./cfn-devenv.sh deploy --stack-name test-stack --region us-east-1 --deploy-tag aws-latest --registry-prefix omgx --secret-name aws-secret-name
```

* To update, for example, the batch-submitter, which is already running, you could:

```
./cfn-devenv.sh update --stack-name test-stack --region us-east-1 --deploy-tag aws-latest --registry-prefix omgx --secret-name aws-secret-name --service-name batch-submitter
```

*WARNING: Stable function of the system generally depends on the services being spun up in a particular order. Most services cannot be simply updated and restarted with any expectation of then having the entire stack work correctly. The correct way to do update a service, is to take the entire system down and then restart it in the cannonical order, which is:*

l1_chain:

deployer:
    depends_on:
      - l1_chain

dtl:
    depends_on:
      - l1_chain
      - deployer - `addresses.json`
      - l2geth

l2geth:
    depends_on:
      - l1_chain
      - deployer - `state-dump.latest.json` and `addresses.json`
    
relayer:
    depends_on:
      - l1_chain
      - deployer - `addresses.json`
      - l2geth

batch_submitter:
    depends_on:
      - l1_chain
      - deployer - `addresses.json`
      - l2geth

verifier:
    depends_on:
      - l1_chain
      - deployer - `state-dump.latest.json` and `addresses.json`
      - dtl
    
integration_tests:

* If you don't specify `--service-name` - all services are going to be updated

* If you don't specify `--secret-name` - the `--deploy-tag` will become `--secret-name`

* To add a new service to the stack, you should add the respective cloudformation template in the `cloudformation` directory,
then add a folder named like the cloudformation template to the `docker` directory, then execute `push2aws`, and then execute `deploy`.

* To login to the server via ssh:
```
./cfn-devenv.sh ssh --stack-name test-stack --region us-east-1

Starting session with SessionId: petar@enya.ai-0bbe0cdbc42865625
sh-4.2$ sudo su
[root@ip-10-0-2-250 bin]# docker ps
```

* To restart a service in a cluster, simply use the command below, it will pull latest container with the same tag and re-read the AWS Secrets again, then run the container:
```
./cfn-devenv.sh restart --stack-name test-stack --service-name batch-submitter
```

*WARNING: Stable function of the system generally depends on the services being spun up in a particular order. Most services cannot be simply updated and restarted with any expectation of then having the entire stack work correctly. The correct way to update a service, for example, is to take the entire system down and then restart it in the cannonical order given above.*

* To see all current ECS clusters provisioned with this automation, run:
```
./cfn-devenv.sh list-clusters
 ---------------
 CLUSTER: rinkeby-infrastructure-application-EcsCluster-UAw9PLUNKtWg
 L2-URL: https://rinkeby.omgx.network
 ---------------

 ---------------
 CLUSTER: dev-integration-infrastructure-application-EcsCluster-MO5arb28VUsC"
 L2-URL: https://dev-integration.omgx.network
 ---------------

```

### cfn-devenv.sh

Simple Bash automation allowing for deployment, updating, destruction of a development environment. The script automatically checks the AWS Elastic Container Registry whether the `DEPLOY_TAG` already exists. If not - images are generated and pushed to the ECR.

The script also outputs the Cloudwatch Log Groups of each of the services, making it easy to monitor the log stream with [saw](https://github.com/TylerBrock/saw) or some other `cloudwatch tail -f` tool.

An example from the cfn-devenv.sh help:

```
Create/Update an environment
    ./cfn-devenv.sh create --stack-name <StackName> --region <Region> --deploy-tag <DeployTag>

    ./cfn-devenv.sh update --stack-name <StackName>  --region <Region>  --deploy-tag <DeployTag> --service-name <service-name>

    ./cfn-devenv.sh update --stack-name <StackName>  --region <Region>  --deploy-tag <DeployTag> --registry-prefix <registry-prefix>

    ./cfn-devenv.sh deploy --stack-name <StackName>  --region <Region>  --deploy-tag <DeployTag> --service-name <service-name> --registry-prefix <registry-prefix>

    ./cfn-devenv.sh deploy --stack-name <StackName>  --region <Region>  --deploy-tag <DeployTag>

Push containers to AWS ECR
    ./cfn-devenv.sh push2aws --service-name <service-name> --region <Region> --deploy-tag <DeployTag> --from-tag <FromTag>

    ./cfn-devenv.sh push2aws --region <Region>  --deploy-tag <DeployTag> --from-tag <FromTag>


Destroy an environment/service
    ./cfn-devenv.sh destroy --stack-name <StackName>  --service-name <service-name> --region <Region> --deploy-tag <DeployTag> [Note: Remove the service from the ECS Cluster]

    ./cfn-devenv.sh destroy --stack-name <StackName>  --region <Region> --deploy-tag <DeployTag> [Note: Remove all services from the ECS Cluster]

```
