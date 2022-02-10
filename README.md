# alanajs

<!-- PROJECT LOGO -->
<div align="center">

<img src="https://www.alanajs.com/alana-Logo.png" width="300px" align="center"/>
<div align="center">
   <h1>AWS Lambda and API Gateway, simplified for JavaScript</h1>
</div>

<!-- PROJECT SHIELDS -->

[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>


## About alanajs

Make setting up Lambda microservices easier than ever. alanajs is a free, open-source npm package that consolidates functionality provided by AWS SDK and AWS CLI, automating deployment and configuration tasks by making intelligent assumptions about the deployment sequence according to best practices. alanajs makes it easy to deploy Lambda functions with dependencies and layers, and it also simplifies creating routes, APIs, and integrations with Lambda on AWS API Gateway.

Here is a [medium]**insert link** article describing the story behind alanajs.

You can also visit us <a href="https://www.alanajs.com" target="_blank">here</a>.

## Table of Contents
<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
      <li><a href="#about-alanajs">About alanajs</a></li>
      <li><a href="#getting-started">Getting Started</a></li>
        <ul>
            <li><a href="#installation-and-setup">Installation and Setup</a></li>  
        </ul>
      <li><a href="#enhancement-and-improvements">Enhancement and Improvements</a></li>
      <ul>
            <li><a href="#built-with">Built With</a></li>
        </ul>
    <li><a href="#reporting-issues">Reporting Issues</a></li>
    <li><a href="#contributors">Contributors</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<p align="right">(<a href="#top">back to top</a>)</p>

## Getting Started

This section describes the instructions for end users who would like to download the package and connect their AWS account. For developers who would like to contribute to the open-source project, follow these [instructions](#enhancement-and-improvements).

### Installation and Setup

1. Install alanajs as a package dependency.

   ```sh
   npm install alanajs
   ```

2. Update the `.env` file in the project root directory with the necessary credentials OR see Step 3 to init through the command line.

   ```sh
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   ROLENAME=
   S3BUCKETNAME=
   AWS_ACCOUNT=
   FOLDER=
   ```

3. Run the follow through the command line to update .env file or create one if it does not exist. Replace the parameters with user's details. Refer to <a href="https://www.alanajs.com/documentation" target="_blank">documentation</a> for more details. The DIRECTORY is the main folder to store files, dependencies, and directories as Lambda functions and layers.

   ```sh
   alana init <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY> [AWS_ACCOUNT] [AWS_REGION] -r [ROLENAME] -b [S3BUCKETNAME] -d [DIRECTORY]
   ```

4. Import the package to start using alana methods.

   ```sh
   import 'alana' from 'alanajs';
   ```

5. That's it! You are ready to start running code through the command line or by running node [fileName] to execute the functions.

<p align="right">(<a href="#top">back to top</a>)</p>
<div align="center">
   <img src="https://www.alanajs.com/cli_demo1.gif" width="700rem"/>
</div>
<p align="center">Figure 1: Create and Update Lambda Function</p>
<br/>
<div align="center">
   <img src="https://www.alanajs.com/cli_demo2.gif" width="700rem"/>
</div>
<p align="center">Figure 2: Create and Update Lambda Layers</p>

<br/>
<div align="center">
   <img src="https://www.alanajs.com/cli_demo3.gif" width="700rem"/>
</div>
<p align="center">Figure 3: Create, Update and Delete Alias</p>

<br/>
<div align="center">
   <img src="https://www.alanajs.com/cli_demo4.gif" width="700rem"/>
</div>
<p align="center">Figure 4: Create, Update and Delete API Gateway</p>

<br/>
<div align="center">
   <img src="https://www.alanajs.com/cli_demo5.gif" width="700rem"/>
</div>
<p align="center">Figure 5: Create, Update and Delete Routes</p>

<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

## Enhancement and Improvements

This section describes the instructions for developers who would like to contribute to the open-source project. For users who would like to download the package and connect their AWS account, follow these [instructions](#getting-started) instead.

### Built With

The alanajs application was built using the following:

- <a href="https://nodejs.org/en/" target="_blank">Node</a>
- <a href="https://github.com/tj/commander.js#readme" target="_blank">Commander</a>
- <a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html" target="_blank">AWS SDK for Javascript V3</a>

1. Fork the project.

2. Create a feature branch.

   ```sh
   git checkout -b feature/featureName
   ```

3. Install package dependencies.

   ```sh
   npm install
   ```

4. Update the `.env` file in the project root directory with the necessary credentials OR init through the command line.

   ```sh
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   ROLENAME=
   S3BUCKETNAME=
   AWS_ACCOUNT=
   FOLDER=
   ```

   ```sh
   alana init <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY> [AWS_ACCOUNT] [AWS_REGION] -r [ROLENAME] -b [S3BUCKETNAME] -d [DIRECTORY]
   ```

5. Add and commit your changes.

   ```sh
   git add ...
   git commit -m 'Add some feature functionality'
   ```

6. Push to the branch.

   ```sh
   git push origin feature/featureName
   ```

7. Open a Pull Request <a href="https://github.com/oslabs-beta/alanajs/pulls" target="_blank">here</a>.

<p align="right">(<a href="#top">back to top</a>)</p>
<!-- Reporting Issues -->

## Reporting Issues

Bugs are tracked through GitHub issues. Create an issue on our repository and provide the following information based on this template:

- **Descriptive title**: Provide a descriptive title for your issue.
- **Describe the issue**: Describe the steps you took leading up to the issue. Try to provide code or screenshots.
- **Expected behavior**: Describe the expected behavior.


<p align="right">(<a href="#top">back to top</a>)</p>
<!-- Contributors -->

## Contributors

- Tin Khin  - 
<a href="https://github.com/Khin92" target="_blank">Github</a> | 
<a href="https://www.linkedin.com/in/tin-khin/" target="_blank">Linkedin</a>
- Eugene Lee - 
<a href="github.com/scc135/" target="_blank">Github</a> | 
<a href="https://www.linkedin.com/in/eugleenyc/" target="_blank">Linkedin</a>

- Amy Liang - 
<a href="github.com/amyliangny/" target="_blank">Github</a> | 
<a href="https://www.linkedin.com/in/aliang18/" target="_blank">Linkedin</a>

- Jae Hyun Ha - 
<a href="https://github.com/msmintyfresh" target="_blank">Github</a> | 
<a href="https://www.linkedin.com/in/jae-hyun-ha/" target="_blank">Linkedin</a>


Project Links: <a href="https://github.com/oslabs-beta/alanajs" target="_blank">Github</a> | <a href="https://www.linkedin.com/company/alanajs" target="_blank">Linkedin</a> | <a href="mediumarticle" target="_blank">Medium</a>**Insert Medium article Link here** | <a href="https://www.alanajs.com" target="_blank">Visit Us</a>

<p align="right">(<a href="#top">back to top</a>)</p>
<!-- LICENSE -->

## License

Distributed under the MIT License. See the [LICENSE](https://github.com/oslabs-beta/alanajs/blob/master/LICENSE) for details

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/oslabs-beta/alanajs.svg?style=for-the-badge
[contributors-url]: https://github.com/oslabs-beta/alanajs/graphs/contributors
[stars-shield]: https://img.shields.io/github/stars/oslabs-beta/alanajs.svg?style=for-the-badge
[stars-url]: https://github.com/oslabs-beta/alanajs/stargazers
[issues-shield]: https://img.shields.io/github/issues/oslabs-beta/alanajs.svg?style=for-the-badge
[issues-url]: https://github.com/oslabs-beta/alanajs/issues
[license-shield]: https://img.shields.io/github/license/oslabs-beta/Alanajs.svg?style=for-the-badge
[license-url]: https://github.com/oslabs-beta/alanajs/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/company/Alanajs-io
[product-screenshot]: client/src/Dashboard/assets/img/helios-blue-logo-t.png
