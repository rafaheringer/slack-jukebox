# Load pulseaudio virtual audio source
pulseaudio -vvv -D --exit-idle-time=-1
# Create virtual output device (used for audio playback)
pactl load-module module-null-sink sink_name=DummyOutput sink_properties=device.description="Virtual_Dummy_Output"
# Create virtual microphone output, used to play media into the "microphone"
pactl load-module module-null-sink sink_name=MicOutput sink_properties=device.description="Virtual_Microphone_Output"
# Set the default source device (for future sources) to use the monitor of the virtual microphone output
pacmd set-default-source MicOutput.monitor
# Create a virtual audio source linked up to the virtual microphone output
pacmd load-module module-virtual-source source_name=VirtualMic
# Allow pulse audio to be accssed via TCP (from localhost only), to allow other users to access the virtual devices
# pacmd load-module module-native-protocol-tcp auth-ip-acl=127.0.0.1
# Configure the user to use the network virtual soundcard
# mkdir -p /home/appuser/.pulse
# echo "default-server = 127.0.0.1" > /home/appuser/.pulse/client.conf
# chown appuser:appgroup /home/appuser/.pulse -R
# Start app
node index.js