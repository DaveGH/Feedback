// JavaScript Document

// Wait for PhoneGap to load
document.addEventListener("deviceready", onDeviceReady, false);

// Update this for each new version released
var UploaderVersion = "1.1.0.0";

var screenWidth = 0;
var screenHeight = 0;

var currentLat = 0;
var currentLong = 0;

var useCamera = true;

var runningForFirstTime = false;

// PhoneGap is ready
function onDeviceReady() {
    alert('start');

    screenWidth = document.body.clientWidth;
    screenHeight = document.body.clientHeight;
        
    // Get the size of the screen
    var homePage = document.getElementById('tabstrip-home');       

    window.setTimeout(function() { StartUploading(); }, 500);
        
    if (HaveSettingsBeenSet() == true)
    {
        LoadSettings();
        takePicture(); 
    }
    else
    {
        window.location.href = '#tabstrip-settings';        
        runningForFirstTime = true;
    }
    
    
    document.getElementById("cmdUpload").onclick = cmdUpload_Clicked;
    cmdPhotoType_Changed(); 
}


function cmdPhotoType_Changed(e)
{
    var sitePhoto = false;
    
    if (e === undefined)
    {
        sitePhoto = true;
    }
    else
    {
        if (e.checked == true)
            sitePhoto = true;
    }
    
    
    if (sitePhoto == true)
    {
        document.getElementById('tblMetric').style.display = 'none';
        document.getElementById('tblImperial').style.display = 'none';
        
    }
    else
    {
        document.getElementById('tblMetric').style.display = '';
        document.getElementById('tblImperial').style.display = 'none';
        
    }

}

function SitePhoto_Init()
{
}

function takePicture()
{
    if (useCamera == true)
    {
        navigator.camera.getPicture(
            onSuccess,  
            onFail, 
            { 
                quality: 50,
                correctOrientation: true,
                destinationType: navigator.camera.DestinationType.DATA_URL 
            }
        );
    }
    else    
    {
        onSuccess("R0lGODlhEAAOALMAAOazToeHh0tLS/7LZv/0jvb29t/f3//Ub//ge8WSLf/rhf/3kdbW1mxsbP//mf///yH5BAAAAAAALAAAAAAQAA4AAARe8L1Ekyky67QZ1hLnjM5UUde0ECwLJoExKcppV0aCcGCmTIHEIUEqjgaORCMxIC6e0CcguWw6aFjsVMkkIr7g77ZKPJjPZqIyd7sJAgVGoEGv2xsBxqNgYPj/gAwXEQA7");
    }
}


function onSuccess(imageData) 
{    
    window.location.href = '#tabstrip-sitePhoto';
    cmdPhotoType_Changed(); 
   
    window.setTimeout(function() 
        {
            // Load the image into memory
            var image = new Image();
            
            // When its loaded (and it takes a moment or 2), run DisplayThumbnail
            image.onload = function() { DisplayThumbnail(image); };
            
            // Set the image to be what has come from the camera.
            image.src = "data:image/jpg;base64," + imageData;  
            
            // Get the lat/long
            GetLocation();
          },
          10
    );
     
}

function GetLocation()
{
    navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError);    
}

function DisplayThumbnail(image)
{
    // Get the width and the height of the container
    var containerHeight = document.getElementById('pnlImageContainer').clientHeight;
    var containerWidth = document.getElementById('pnlImageContainer').clientWidth;
    
    var imageHeight = image.height;
    var imageWidth = image.width;
    

    var imgPreview = document.getElementById('imgPreview1'); 
    
    if ((imageHeight / containerHeight) > (imageWidth / containerWidth))
    {
        imgPreview.height = containerHeight;
        imgPreview.width = imageWidth * containerHeight / imageHeight;        
    }
    else    
    {
        imgPreview.width = containerWidth;
        imgPreview.height = imageHeight * containerWidth / imageWidth;
    }
    
    imgPreview.src = image.src;
}


function cmdUpload_Clicked(e)
{       
    var imgPreview = document.getElementById('imgPreview1'); 
    
    // Do the resizing and the uploading in the background
    window.setTimeout( function() { ResizeImage(imgPreview.src, 1024, 768, ResizeFinished); }, 1);
    
    // Take another picture.
    takePicture();
}



function ResizeImage(image, maxWidth, maxHeight, onSuccess)
{
    console.log("Resizing " + image);
    
    var img = new Image();
	var canvas=document.getElementById("myCanvas");
	var ctx=canvas.getContext("2d");	
    var canvasCopy = document.createElement("canvas");
    var copyContext = canvasCopy.getContext("2d");

    img.onload = function()
    {
        var ratio = 1;

        if(img.width > maxWidth)
            ratio = maxWidth / img.width;
        else if(img.height > maxHeight)
            ratio = maxHeight / img.height;

        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, 0, 0);

        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
	
        onSuccess(image);		
    };

    img.src = image;
}


function ResizeFinished(dataUrl)
{
    console.log("Resize finished " + dataUrl);

    // Save the image now    
    SaveImage(dataUrl);
}



function SaveImage(dataUrl)
{   
    console.log("About to Save to the local storage " + dataUrl);
        
    var image = { 
        xMaj: 1, 
        yMaj: 1, 
        zMaj: 1, 
        deviceCordova: window.device.cordova,
        deviceName: window.device.name,
        devicePlatform: window.device.platform,
        deviceUuid: window.device.uuid,
        deviceVersion: window.device.version,
        uploaderVersion: UploaderVersion,
        orientation: window.orientation,
        lat: currentLat, 
        long: currentLong,  
        localTime: new Date().getTime(),  // in milliseconds from 01 January, 1970 00:00:00  
        data: dataUrl };
    
    // Convert the map into a string so that it can be stored in the local storage
    var json = JSON.stringify(image);
    
    // Save it to the local store
    window.localStorage.setItem(window.localStorage.length + 1, json);
    
    UpdateStatus("Uploading photos... " + (window.localStorage.length - 1) + " remaining.");
 
    // The upload 'thread' will upload this within the next second.
    console.log("Saved to the local storage");
}


function onFail(message) 
{    
    alert('Failed because: ' + message);
}

var count = 0;
function UpdateStatus(message)
{
    count = count + 1;

    document.getElementById("lblStatus").innerHTML = message; // + " " + count;       
}

var currentKey = "";

function StartUploading()
{
    
    try
    {
        var networkState = navigator.network.connection.type;
        if (networkState == Connection.NONE)
        {
            UpdateStatus("No internet... " + window.localStorage.length - 1 + " photos queued to be uploaded.");
            
            // Start this method again
            window.setTimeout(function() { StartUploading(); }, 1000);
        }
        else if (window.localStorage.length <= 1)
        {
            UpdateStatus("");
            
            // Start this method again
            window.setTimeout(function() { StartUploading(); }, 500);
        }
        else
        {
            UpdateStatus("Uploading photos... " + (window.localStorage.length - 1) + " remaining.");
            
            // Get the photo's details from the local storage
            // Make sure it is not SETTINGS though
            var index = 0;
            while(index < window.localStorage.length)
            {
                currentKey = window.localStorage.key(index);
                if (currentKey != "SETTINGS")
                    break;                
                
                index++
            }
            
            if (currentKey != "")
            {
                var post = window.localStorage.getItem(currentKey);    
                
                // De-json-ify it
                var postSerialise = JSON.parse(post);
                
                // Upload it 
                console.log("Uploading: " + postSerialise.data);               
                $.ajax({
                    type: "POST",
                    url: "http://www.tired.com/",   // TODO: Change
                    data: postSerialise, 
                    success: UploadComplete, 
                    error: UploadFailed });
            }
         
        }
    }
    catch(e)
    {
        console.log("Error uploading: " + e);   
        
        // Start this method again
        window.setTimeout(function() { StartUploading(); }, 1000);
    }    
}


function UploadComplete(responseData)
{
    console.log("Upload complete: " + responseData);
    
    // Remove it from the storage
    window.localStorage.removeItem(currentKey)

    // Start this method again
    window.setTimeout(function() { StartUploading(); }, 1);
}

function UploadFailed(responseData)
{
    console.log("Upload failed: " + responseData);
    
    // Start this method again
    window.setTimeout(function() { StartUploading(); }, 500);
}


function SaveSettingsAndReturn()
{
    SaveSettings();
    
    if (runningForFirstTime == true)
        takePicture();
    else
        window.location.href = '#tabstrip-sitePhoto';    
}

function SaveSettings()
{
    var settings = 
    {
        name: $('#txtName').val(),
        company: $('#txtCompany').val(),
        phone: $('#txtPhone').val(),
        email: $('#txtEmail').val(),
        unitOfMeasure: document.getElementById('optUnitsOfMeasure').current
        
    }
    
    // Convert the map into a string so that it can be stored in the local storage
    var json = JSON.stringify(settings);
    
    // Save it to the local store
    window.localStorage.setItem("SETTINGS", json);
}


function LoadSettings()
{   
    var json = window.localStorage.getItem("SETTINGS");
        
    if (json != "undefined")
    {        
        // Convert the map into a string so that it can be stored in the local storage
        var settings = JSON.parse(json);
        
        $('#txtName').val(settings.name);
        $('#txtCompany').val(settings.company);
        $('#txtPhone').val(settings.phone);
        $('#txtEmail').val(settings.email);
        
    }    
}


function ClearSettings()
{   
    window.localStorage.removeItem("SETTINGS");
}

function HaveSettingsBeenSet()
{
    var json = window.localStorage.getItem("SETTINGS");
    
    if (json == null)
        return false;
    else
        return true;
}

//=======================Geolocation Operations=======================//
// onGeolocationSuccess Geolocation
function onGeolocationSuccess(position) {    
    currentLat = position.coords.latitude;
    currentLong = position.coords.longitude;
}


// onGeolocationError Callback receives a PositionError object
function onGeolocationError(error) {
    // Every 30 secs attempt to get the position again. Maybe we will get the position 
    // by the time they press upload. Otherwise we will be using possibly an old position.
    window.setTimeout(function() { GetLocation(); }, 30000);
}