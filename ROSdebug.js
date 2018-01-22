// Connecting to ROS
// -----------------

  var ros = new ROSLIB.Ros({
    url : "ws://" + window.location.hostname + ":9090" // connect to ROS on defualt port 9090
  });

  ros.on('connection', function() {
    console.log('Connected to websocket server.');
  });

  ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
  });

  ros.on('close', function() {
    console.log('Connection to websocket server closed.');
  });

// Subscribing to a Topic
// ----------------------

  // setup listener
  var listener = new ROSLIB.Topic({
    ros : ros,
  });
  // grey out old text
  var echo_timeout
  function echo_old(){
    document.getElementById('echo').style.color = " #999";
  }

  // echo a topic based on an input
  function echo_topic(topic) {
    listener.unsubscribe(); // unsubscribe from old topic
    var text = document.getElementById('echo'); // html block to echo to
    text.innerHTML = topic + ':'; // initialize text to <topic name>:
    clearTimeout(echo_timeout); // clear timer to grey out text
    text.style.color = "#fda"; // set text to black
    listener.name = topic;
    listener.subscribe(function(message) {
      // callback function
      text.innerHTML = (topic + ':\n' + JSON.stringify(message, null, 4));
      clearTimeout(echo_timeout);
      text.style.color = "#fda"
      echo_timeout = setTimeout(echo_old, 2000);
    });
  }

// Getting and setting a param value
// ---------------------------------

  function refresh_param_list(){
    ros.getParams(function(params) {
      var value = String(params).replace(/,/g,'\n');
      document.getElementById('param_list').innerHTML=value;
    });
  }
  setInterval(refresh_param_list, 5000);

  function get_param(name){
    var param = new ROSLIB.Param({
      ros : ros,
      name : name
    });
    param.get(function(value){
      var text = document.getElementById('get_param');
      text.innerHTML = param.name + ': ' + value;
    });
  }

// Service Call to get node/topic/param list
// -----------------------------

  var nodeListClient = new ROSLIB.Service({
    ros : ros,
    name : '/rosapi/nodes',
    serviceType : 'rosapi/Nodes'
  });
  var serviceRequest = new ROSLIB.ServiceRequest();
  
  function refresh_node_list(){
    nodeListClient.callService(serviceRequest, function(result){
      text = document.getElementById('node_list');
      text.innerHTML = (JSON.stringify(result.nodes, null, 4));
    });
  }
  setInterval(refresh_node_list, 5000);

  var topicListClient = new ROSLIB.Service({
    ros : ros,
    name : '/rosapi/topics',
    serviceType : 'rosapi/Topics'
  });
  
  function refresh_topic_list(){
    topicListClient.callService(serviceRequest, function(result){
      text = document.getElementById('topic_list');
      text.innerHTML = (JSON.stringify(result.topics, null, 4));
    });
  }
  setInterval(refresh_topic_list, 5000);

// Publishing to a Topic
// ---------------------
  var messageTypeClient = new ROSLIB.Service({
    ros : ros,
    name : '/rosapi/topic_type',
    serviceType : 'rosapi/TopicType',
    topic :'/python/hello_world'
  });
  
  function check_message_type(input_topic){
    if (event.keyCode == 13){
      get_msg_outline();
    }
    else {
      var msgServiceRequest = new ROSLIB.ServiceRequest({topic:input_topic});
      //messageTypeClient.topic = input_topic;
      messageTypeClient.callService(msgServiceRequest, function(result){
        text = document.getElementById('pub_message_type');
        if (result.type != ''){
          text.value = result.type;
        }
      });
    }
  }

  var msgInfoClient = new ROSLIB.Service({
    ros : ros,
    name : '/rosapi/message_details',
    serviceType : 'rosapi/MessageDetails',
    type :'std_msgs/String'
  });
  
  function get_msg_outline(){
    console.log('click');
    msg_type = document.getElementById('pub_message_type').value;
    var msgInfoServiceRequest = new ROSLIB.ServiceRequest({type:msg_type});
    text = document.getElementById('pub_message');
    msgInfoClient.callService(msgInfoServiceRequest, function(response){
      text.value = msg_response_to_outline(response);
    });
  }

  function msg_response_to_outline(msg_response){
    var out_str = '{';
    out_str += msg_outline(msg_response, msg_response.typedefs[0], '\n  ');
    out_str = out_str.slice(0, -1);
    out_str += '\n}'
    return out_str
  }
  function msg_outline(msg_response, typedef, newline){
    var names = typedef.fieldnames;
    var examples = typedef.examples;
    var types = typedef.fieldtypes;
    var out_str = '';
    try {var reseti = i; var resetj = j;}
    catch(err) {}
    for (i=0; i<names.length; i++){
      out_str += newline;
      out_str += '"' + names[i] +  '" :';
      if (types[i] == "string"){
        out_str += '"' + examples[i] + '",';
      }
      else if(examples[i]=='{}'){
        out_str += '{';
        for (j=0; j<msg_response.typedefs.length; j++){
          if (msg_response.typedefs[j].type==types[i]){
            out_str += msg_outline(msg_response, msg_response.typedefs[j], newline + '  ');
          }
        }
        out_str = out_str.slice(0, -1);
        out_str += newline + '},';
      }
      else{
        out_str += examples[i] + ',';
      }
    }
    i = reseti; j=resetj;
    return out_str;
  }
  var pubMsg = new ROSLIB.Message({});

  function publish_message(){
    var text = document.getElementById('pub_message').value;
    var topic = document.getElementById('pub_message_topic').value;
    var type = document.getElementById('pub_message_type').value;
    try {var obj = JSON.parse(text);}
    catch (err) {console.log(err);}
    
    var pubTopic = new ROSLIB.Topic({
      ros : ros,
      name : topic,
      messageType : type
    });
    //pubTopic.name = topic;
    //pubTopic.messageType = type;
    try {pubTopic.publish(obj);}
    catch (err) {console.log(err);}
  }
