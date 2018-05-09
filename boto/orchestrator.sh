#!/bin/bash

# Boto script is required as a parameter in order to run the program

if (( $# != 8 )); then
    echo "ERROR: Wrong number of parameters."
    echo "The program should use the following 3 parameters:"
    echo "    -b 'boto_executable' "
    echo "    -h 'ansible_host_file'"
    echo "    -k 'ssh_key_file'"
    echo "    -a 'ansible_file'"
    exit -1
fi

while test $# -gt 0; do
        case "$1" in
                -h)
                        host=$2
                        shift
                        shift
                        ;;
                -b)
                        boto=$2
                        shift
                        shift
                        ;;
                -k)
                        key=$2
                        shift
                        shift
                        ;;
                -a)
                        ansible=$2
                        shift
                        shift
                        ;;

                *)
                        break
                        ;;
        esac
done

# The output is the program (IP address) is saved into 'result' variable
result=`python $boto`

if [ "$?" -ne 0 ]; then
    echo "ERROR: Unexpected error while creating new instance";
    echo $result
    exit 1;
fi

echo "Instance created successfully. New instance IP: $result"


# The IP address is added to the ansible hosts file
echo $result >> $host


# We wait for the instance to have the SSH service ready
echo "Waiting for SSH service for starting deployment"

sleep 100

# We run ansible playbook
ansible-playbook $ansible -i $host -u ubuntu --key-file=$key
