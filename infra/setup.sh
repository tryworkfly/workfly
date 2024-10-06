#! /bin/bash

SSH_FILE_NAME="instance_workfly_ed25519"

if [ -e ~/.ssh/$SSH_FILE_NAME ] ; then
  echo "Existing SSH keys were found. Reusing keys..."
else
  echo "Generating new SSH keys and adding to ~/.ssh folder..."
  ssh-keygen -t ed25519 -C "instance_workfly" -f "${SSH_FILE_NAME}" && mv -i ${SSH_FILE_NAME}* ~/.ssh
  ssh-add ~/.ssh/${SSH_FILE_NAME}
fi

echo "Running Terraform..."

terraform -chdir="./terraform" init
terraform -chdir="./terraform" apply || exit 1

WORKFLY_IP=$(terraform -chdir="./terraform" output -raw instance_ip)

[[ $WORKFLY_IP =~ [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3} ]] || (echo "Terraform returned invalid IP address for workfly. Exiting..."; exit 1)

echo "Terraform successfully provisioned infrastructure. IP address for workfly: ${WORKFLY_IP}"

echo "Configuring Ansible variables with medusa IP/static mount device and SSH key path..."

sed -i "s/ansible_host:.*/ansible_host: \"${WORKFLY_IP}\"/" ansible/host_vars/workfly.yaml
sed -i "s/ansible_ssh_private_key_file:.*/ansible_ssh_private_key_file: \"~\/.ssh\/${SSH_FILE_NAME}\"/" ansible/host_vars/workfly.yaml

if [[ -e ansible/.venv ]] ; then
  echo "Using existing venv directory..."
else
  echo "Creating venv for Ansible runtime..."
  python -m venv ansible/.venv || exit 1
fi

source ansible/.venv/bin/activate

ansible-galaxy role install -r ansible/requirements.yaml || exit 1
ansible-playbook -i ansible/inventory.yaml ansible/playbook.yaml --ask-become-pass || exit 1
