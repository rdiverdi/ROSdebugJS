# ROSdebugJS
Web based debugging console for ROS

## What It Does
ROSdebugJS is a web-based interface for echoing and subscribing to ROS topics, checking ROS parameters, and seeing the current topics, nodes, and parameters. It is based on the `roslibjs` library and is setup to work with any ROS topic or message.

## How to Use

### Echo a topic:
Type the topic name in the input and press enter, the topic name will be shown under the input box

### Publish a message
Type the topic name in the input, if it already exists, the message type should be filled in automatically, then press enter and a message outline will pop up in the message box. (if the message type doesn't fill in, type it in and press enter there). Fill in your data and press the publish button to publish. (enter doesn't publish the message to allow for formatting decisions)

### get a parameter value
Type the parameter name in the input and press enter.

### Lists
The lists auto-refresh every 5 seconds, refresh buttons are mostly there to give you something to press while you're being impatient.
