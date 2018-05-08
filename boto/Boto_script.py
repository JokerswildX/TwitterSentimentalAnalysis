
# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
#
#																IMPORT SECTION
#
# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------

import boto.ec2
from boto.ec2.regioninfo import RegionInfo
import time

# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
#
#																CONFIGURATION PARAMETERS
#
# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------

def establish_connection():

	REGION = 'melbourne'
	AWS_ACCESS_KEY_ID =  'XXXXXXXXXXXXXXXXXXXXXXX'
	AWS_SECRET_KEY_KEY = 'XXXXXXXXXXXXXXXXXXXXXXX'
	PORT = '8773'
	ENDPOINT_PATH = '/services/Cloud'
	ENDPOINT = 'nova.rc.nectar.org.au'


	my_region = RegionInfo(name=REGION, endpoint=ENDPOINT)
	connection = boto.connect_ec2(
						aws_access_key_id=AWS_ACCESS_KEY_ID,
						aws_secret_access_key=AWS_SECRET_KEY_KEY,
						is_secure=True,
						region=my_region,
						port=PORT,
        				path=ENDPOINT_PATH,
        				validate_certs=False
						)
	print ("Connection established with http://%s:%s%s" % (ENDPOINT, PORT, ENDPOINT_PATH))

	return connection


def run_instance(conn):
	
	INSTANCE_TYPE = 'm2.tiny'
	SECURITY_GROUPS = ['default', 'ssh']
	KEY_NAME = 'XXXXXXXXXXXXXXX'
	
	new_reservation = conn.run_instances(
    				    'ami-86f4a44c',
        				key_name=KEY_NAME,
        				instance_type=INSTANCE_TYPE,
        				security_groups=SECURITY_GROUPS
        				)

	new_instance = new_reservation.instances[0]

	while new_instance.state == u'pending':
		print('Creation status: {}'.format(new_instance.state))
		time.sleep(20)
		new_instance.update()

	print('Done!. Instance Id: {} ; IP: {} ; Zone: {} ;  Status: {}.'.format(new_instance.id, new_instance.private_ip_address, new_instance.placement, new_instance.state))

	return new_instance



def stop_instance(conn, instance):
	conn.stop_instances(instance)
	return None




def terminate_instance(conn, instance):
	conn.terminate_instances(instance)
	return None




def main():
	
	# We attempt to establish a connection with Nectar Server
	conn = establish_connection()

	# We run an instance 
	instance = run_instance(conn)


if __name__ == '__main__':
    main()
