# alanajs

<!-- PROJECT LOGO -->
<div align="center">

<img src="./public/alanajslogo.png" width="300px" align="center"/>
<div align="center">
   <h1>AWS Lambda and API Gateway, simplified for JavaScript</h1>
</div>

<!-- PROJECT SHIELDS -->

[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

</div>


## About alanajs


Make setting up Lambda microservices easier than ever. alanajs is a free, open source npm package that makes it easy to create and deploy Lambda functions, incorporate microservices in your application, and add integrations with AWS API gateway. Designed specifically for the Node.js runtime environment, alanajs consolidates functionality provided by AWS SDK and IDE tookits, automating your deployment and configuration tasks so that you can focus on writing code. 

Here is a [medium]**insert link** article describing the story behind alanajs.

You can also visit us [here]**insert demo link**.

## Table of Contents
<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
      <li><a href="#about">About alanajs</a></li>
      <li><a href="#getting-started">Getting Started</a></li>
        <ul>
            <li><a href="#installation-and-setup">Installation and Setup</a></li>  
        </ul>
      <li><a href="#enhancement-improvements">Enhancement and Improvements</a></li>
      <ul>
            <li><a href="#built-with">Built With</a></li>
        </ul>
    <li><a href="#reporting-issues">Reporting Issues</a></li>
    <li><a href="#contributors">Contributors</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## Getting Started

This section describes the instructions for end users who would like to download the package and connect their AWS account. For developers who would like to contribute to the open-source project, follow these [instructions](#enhancement-improvements).

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

3. Run the follow through the command line to update .env file or create one if it does not exist. Replace the parameters with user's details. Refer to **insert demo link documentation here** for more details. The DIRECTORY is the main folder to store files, dependencies, and directories as Lambda functions and layers.

   ```sh
   alana init <AWS_ACCESS_KEY_ID> <AWS_SECRET_ACCESS_KEY> [AWS_ACCOUNT] [AWS_REGION] -r [ROLENAME] -b [S3BUCKETNAME] -d [DIRECTORY]
   ```

4. Import the package to start using alana methods.

   ```sh
   import 'alana' from 'alanajs';
   ```

5. That's it! You are ready to start running code through the command line or by running node [fileName] to execute the functions.
<<<<<<< HEAD
=======

<div align="center">
<img src="./public/npmdemo2.png" width="500px"  align="center"/>

>>>>>>> 60fdba4e6ad180ab9692ee7834eb9995f09b3d4b

<div align="center">
   <img src="./public/cli_demo1.gif" width="700rem" height="300rem"/>
</div>
<br/>
<div align="center">
   <img src="./public/cli_demo2.gif" width="700rem" height="300rem"/>
</div>
<br/>
<div align="center">
   <img src="./public/cli_demo3.gif" width="700rem" height="300rem"/>
</div>
<br/>
<div align="center">
   <img src="./public/cli_demo4.gif" width="700rem" height="300rem"/>
</div>
<br/>

<p align="right">(<a href="#top">back to top</a>)</p>

## Enhancement and Improvements

This section describes the instructions for developers who would like to contribute to the open-source project. For users who would like to download the package and connect their AWS account, follow these [instructions](#getting-started) instead.

### Built With

The alanajs application was built using the following:

- [Node](https://nodejs.org/en/)
- [Commander](https://tj.github.io/commander.js/)

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
   git commit -am 'Add some feature functionality'
   ```

6. Push to the branch.

   ```sh
   git push origin feature/featureName
   ```

7. Open a Pull Request [here](https://github.com/oslabs-beta/alanajs/pulls)

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

- Tin Khin  - [Github](https://github.com/Khin92) | [Linkedin](https://www.linkedin.com/in/tin-khin/)
- Eugene Lee -[Github](github.com/scc135/) | [Linkedin](https://www.linkedin.com/in/eugleenyc/)
- Amy Liang - [Github](https://github.com/connor-gillis) | [Linkedin](https://www.linkedin.com/in/connor-gillis/)
- Jae Hyun Ha - [Github](https://github.com/msmintyfresh) | [Linkedin](https://www.linkedin.com/in/jae-hyun-ha/
)

Project Links: [Github](https://github.com/oslabs-beta/alanajs) | [Linkedin](https://www.linkedin.com/company/alanajs) | [Medium]**Insert Medium article Link here** | [Visit Us]**Insert demo Link here**

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
