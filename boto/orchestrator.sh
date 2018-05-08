
# Boto script is required as a parameter in order to run the program

if (( $# != 1 )); then
    echo "ERROR: Wrong number of parameters. Boto script missing"
    exit -1
fi


# The output is the program (IP address) is saved into 'result' variable
result=`python $1`

if [ "$?" -ne 0 ]; then
    echo "ERROR: Unexpected error while creating new instance";
    echo $result
    exit 1;
fi

echo "Instance created successfully. New instance IP: $result"


# The IP address is added to the ansible hosts file
echo $result >> '/home/ubuntu/ansible/hosts'
echo "Host $result" >> '/home/ubuntu/.ssh/config'
echo "  IdentityFile ~/.ssh/id" >> '/home/ubuntu/.ssh/config'


# We wait for the instance to have the SSH service ready
echo "Waiting for SSH service for starting deployment"

sleep 100

# We run ansible playbook
ansible-playbook '/home/ubuntu/ansible/install.yml' -i '/home/ubuntu/ansible/hosts' -u ubuntu
