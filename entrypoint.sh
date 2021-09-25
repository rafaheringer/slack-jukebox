# Load pulseaudio virtual audio source
pulseaudio -vvv -D --exit-idle-time=-1
#
# Create virtual microphone output, used to play media into the "microphone"
pactl load-module module-null-sink sink_name=MicOutput sink_properties=device.description="Virtual_Microphone_Output"
#
# Create a virtual audio source linked up to the virtual microphone output
pacmd load-module module-virtual-source source_name=VirtualMic
#
# Set the default source device (for future sources) to use the monitor of the virtual microphone output
pacmd set-default-source VirtualMic
#
# Start app
node index.js