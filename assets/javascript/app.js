$(document).ready(function(){
  // Golobal Varibale
  var eventsArray= [];
  var markers;  
  
  // set up current time

    function timer() {
        var datetime = null,
        date = null;

        var update = function () {
        date = moment(new Date())
        datetime.html("<i class='far fa-clock'></i> " + date.format('dddd, MMMM Do YYYY, h:mm:ss a'));
        };

        $(document).ready(function(){
        datetime = $('#current-time')
        update();
        setInterval(update, 1000);
        });
    }
    timer();
    
    function searchEventsNearMe(address, price, category, radius) {
      eventsArray = [];
      $("#search-view").empty();
      $("#detail-view").empty();
      // Querying the EventBrite api for the selected address
      var queryURL = "https://www.eventbriteapi.com/v3/events/search/?sort_by=best&location.address=" + address + "&price=" + price + "&categories=" + category + "&location.within=" + radius + "&token=CM3FPDQCMD3DZSJA47PF&expand=venue";
      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {

        // Printing the entire object to console
        console.log(response);
          for (var i = 0; i <= 5; i++) {
            var eventNearMe = {
              eventName: response.events[i].name.text,
              eventURL: response.events[i].url,
              eventImage: response.events[i].logo.url,
              eventLat: response.events[i].venue.latitude,
              eventLon: response.events[i].venue.longitude,
              eventVenueName: response.events[i].venue.name,
              eventAddress1: response.events[i].venue.address.address_1,
              eventAddress2: response.events[i].venue.address.address_2,
              eventAddressCity: response.events[i].venue.address.city,
              eventAddressState: response.events[i].venue.address.region,
              eventAddressZipcode: response.events[i].venue.address.postal_code,
              eventTime: response.events[i].start.local,
              eventCost: response.events[i].is_free
            }
          eventsArray.push(eventNearMe)
          $("#search-view").append($("<p>").html(i+1 + ".   " + eventNearMe.eventName).attr("index",i).attr("class","events"));
        }
      });
    }

    $(document).on("click",".events", function(){
      console.log("hi");
      var index= $(this).attr("index");
      var fullAddress = eventsArray[index].eventAddress1 + " " +eventsArray[index].eventAddress2 + " " + eventsArray[index].eventAddressCity + ", "+ eventsArray[index].eventAddressState + ", " +eventsArray[index].eventAddressZipcode;
      console.log(index);
      var time = eventsArray[index].eventTime;
      time = moment(time).format('MMMM Do YYYY, h:mm a')
      $("#detail-view").empty();
      $("#detail-view").append($("<h1>").html(eventsArray[index].eventName).addClass("eventTitle"));
      $("#detail-view").append($("<img>").attr("src",eventsArray[index].eventImage).addClass("eventImage"));
      $("#detail-view").append($("<div>").wrap('<a href="'+ eventsArray[index].eventURL + '"></a>').addClass("eventURL"));
      $("#detail-view").append($("<div>").html("<p> <strong>Address : </strong></p>" + fullAddress).addClass("eventAddress"));
      $("#detail-view").append($("<div>").html("<p> <strong>Date & Time : </strong></p>" + time).addClass("eventTime"));
      $("#detail-view").append($("<div>").addClass("register-btn text-center").html("<button type='button' ' id='eventBtn' class='btn btn-success btn-lg'>Register</button>"));
      $("#eventBtn").on("click", function() {
        window.open(eventsArray[index].eventURL, "_blank");
      });
     
     // map coding
     
      var location= {lat: parseFloat(eventsArray[index].eventLat), lng: parseFloat(eventsArray[index].eventLon)};
      console.log(location);
      if(markers==null){
            markers= new google.maps.Marker({
                map: map,
                title: "none",
                position: location
              });
      }
      else{
          markers.setMap(null);
          markers= null;
          markers= new google.maps.Marker({
              map: map,
              title: "none",
              position: location
            });
      }
    })
  
    // Event handler for user clicking the get-address button
    $("#search-btn").on("click", function(event) {
      // Preventing the button from trying to submit the form
      event.preventDefault();
      // Storing the address
      var inputAddress = $("#inputAddress").val().trim();
      var inputCity = $("#inputCity").val().trim();
      var inputState = $("#inputState").val().trim();
      var inputZip = $("#inputZip").val().trim();
      var combinedAddress = inputAddress+ "" + inputCity + "" + inputState + "" + inputZip;

      //sort by price

      if ($("#priceRange").val() === "1") {
        inputPrice = "free";
      } else if ($("#priceRange").val() === "2") {
        inputPrice = "paid";
      } else {
        inputPrice = false;
      }

      // sort by categories

      if ($("#inputCategories").val() === "1") {
        inputCategory = "104";
      } else if ($("#inputCategories").val() === "2") {
        inputCategory = "113";
      } else if ($("#inputCategories").val() === "3") {
        inputCategory = "108";
      } else if ($("#inputCategories").val() === "4") {
        inputCategory = "103";
      } else if ($("#inputCategories").val() === "5") {
        inputCategory = "110";
      } else if ($("#inputCategories").val() === "6") {
        inputCategory = "119"; 
      } else {
        inputCategory = "104,113,108,103,110,119";
      };


      //Radius input
        if ($("#inputRadius").val() === "1") {
          var inputRadius = "1mi";
      } else if ($("#inputRadius").val() === "2") {
          var inputRadius = "2mi";
      } else if ($("#inputRadius").val() === "3") {
          var inputRadius = "3mi";
      } else {
          var inputRadius = "1mi";
      }
  
      console.log(combinedAddress);
      // Running the searchEventsNearMe function(passing in the address as an argument)
      searchEventsNearMe(combinedAddress, inputPrice, inputCategory, inputRadius);
    });


  var config = {
    apiKey: "AIzaSyBCzVoitJ-vXPfU1tLE6v4D1kaaxfJgAQY",
    authDomain: "carpediemratings.firebaseapp.com",
    databaseURL: "https://carpediemratings.firebaseio.com",
    projectId: "carpediemratings",
    storageBucket: "carpediemratings.appspot.com",
    messagingSenderId: "152656758935"
  };

  firebase.initializeApp(config);
  var dataRef = firebase.database();
  // Initial Values
  var rating = "";
  // Capture Button Click
  $("#add-user").on("click", function(event) {
    event.preventDefault();
    // rating = $('.btn-group > .btn.active').val().trim();
    rating = $('input[name=rating]:checked').val().trim();
    // rating = $("#rating-input").val().trim();
    dataRef.ref().push({
      rating: rating,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
  });
  // Firebase watcher + initial loader HINT: .on("value")
  dataRef.ref().on("child_added", function(snapshot) {
    // Log everything that's coming out of snapshot
    console.log(snapshot.val());
    console.log(snapshot.val().rating);
    // Change the HTML to reflect
    $("#rating-display").text(snapshot.val().rating);

    // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

});