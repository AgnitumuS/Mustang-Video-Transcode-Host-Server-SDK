# Mustang-200 SDK

This repository contains a SDK and sample application that demonstrates the capabilities of the Mustang-200. It is provided for developers to build their own applications. 
The SDK Released under Open Source License.SDK can be installed in a few steps.

## Installation  guide

Note: Please run all the following steps as the root user. Create the path /share/Public in the system and put the Mustang Host project inside this path.

#### Step1:
Download the Mustang Host project from https://github.com/IEI-dev/Mustang-Video-Transcode-Host-Server-SDK on github

#### Step2:
Install NodeJS in your system with the following command: 
	a. sudo  apt-get update 
	b. curl -sL https://deb.nodesource.com/setup_7.x | bash - && apt-get install -y nodejs

#### Step3:
Change to the Mustang Host SDK directory and run the following command:
**sudo npm install**

#### Step4:
In the Mustang Host root directory, run the following command :
**sudo node mvt_host.js**

## Host API
         
IEI Integration Corp provides customers with Host APIs to create streaming applications. Users can either use the IEI Web application or create their own applications. 
Our APIs are robust and easy to understand. We also provide the Host API source code under Open source License to allow users to modify it to meet their requirements. 
The Host API was developed using Node JS.

APIs are simple HTTP requests. Customers can develop their application using GET POST PUT DELETE requests.

### Example :

The following example is a simple GET request to discover the number of cards installed in the Host PC. 

GET http://127.0.0.1:8000/mvt/api/v1/cards

### Response 
Array of Card Ids [CARD1,CARD2,CARD3]

IP Address and Port numbers you can find in IEI Web Application configuration page

## Host API Documentation 
The Mustang-200 Host API reference document explains in detail each API request and response body structure in detail. The IEI Web Application is developed based on this Host API.

[Mustang-200 Host API reference](https://github.com/IEI-dev/Mustang-Video-Transcode-Host-Server-SDK/blob/master/apidoc/Mutang200HostAPIReference.pdf)

## Mustang Web Application

 The Mustang-200 Transcoding application handles all the features of Mustang-200. It was developed based on the Host API. So developers can refer to this application to call APIs 
 in their application. It is released under open source license, allowing users to modify it to meet their requirements.

 The Transcoding Application is capable of handling multiple Mustang-200 cards. You can manage and monitor all of the cards using this application.
 Also you can navigate to the Mustang-200 operating system named QTS by clicking the QTS icon in the application. QTS is a lightweight custom operation system developed by QNAP.
 
 The Transcoding Application is capable of VOD, Live and File scenarios. Each Transcoding scenario can be created using simple wizard steps.
 Each step is explained in detail in the application documentation.
 
 Transcoding Application builds with Media Player to view the video when VOD and Live Job is running.
 
 The IEI Transcoding application is developed based on React JS and Node JS Frameworks.

        
