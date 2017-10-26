 // deviceId, deviceToken, devicePlatform, userId(authToken)


        $(function(){
            $("#connect").on("click",onClick)
        })
        var socket;
        function onClick(){

            var dToken = $("#dToken").val();
            var userToken = $("#userToken").val();
            var dPlatform = $("#dPlatform").val();

            var port = "8000";

            var socket = io(`${window.location.protocol}//${window.location.hostname}:${port}`,{
                forceNew:true,
                query: "deviceToken="+dToken+"&devicePlatform="+dPlatform+"&token="+userToken
            });

            // socket = io.connect("http://task-fwc01.rhcloud.com:8000",{
            //     reconnect: true,
            //     //query: "token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1Nzg3M2IzMjI3YTAwNjgxMTBjMzEzZTciLCJpYXQiOjE0NzQ4MTUzNjYsImV4cCI6MTUwNjM1MTM2Nn0.BUqvIxc6jHnlGo0stOJqnpsQja29Dzrtkke7ESgEfRQ?deviceToken=APA91bHFY0Ou41BnEjqahkoSGjNuYYu96KTVk4q4Oe8EB6nu3QMK3DnMGGou52OhtFEjWXvGMdLnryze1ACu-3nvmCMRt8gMRjU1CC7eTbyRKskeAXc91ZjPkD4pu1dqhKHFeR_-JjFF"
            //     query: "deviceToken="+dToken+"&devicePlatform="+dPlatform+"&token="+userToken
            // });



            socket.on("task:save", function(data){
                console.log(data);
                $("<div>").text(JSON.stringify(data)).appendTo("#msgs");
            })
            // socket.on("message:save", function(data){
            //     console.log(data);
            //     $("<div>").text(JSON.stringify(data)).appendTo("#msgs");
            // })        

            socket.on('error', function(error) {
              console.log(error);
              console.log('socket status : ', socket.connected);
              alert("Socket error");
            });

            socket.on('connect', function() {
              console.log('socket status : ', socket.connected);
              console.log('socket id ', socket.id);
              $("#status").text("Socket is connected");
            });

            socket.on('disconnect', function(){
               console.log('socket status : ', socket.connected);
               $("#status").text("Socket is dis-connected");
            });
       
        }

        $(function(){
            $(document).on("click","#disconnect",function(){
                socket.disconnect();
            })
            $(document).on("click","#reconnect",function(){
                socket.connect();
            })
            $(document).on("keydown", "#test",function(event) {
              if(event.which == 13){
                var txt = $(this).val();
                socket.emit("test",txt,function(confirmation){
                    alert(confirmation);
                });
              }
            })
        });