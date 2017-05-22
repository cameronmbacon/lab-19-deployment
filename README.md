![cf](https://i.imgur.com/7v5ASc8.png) Lab 19 - HEROKU DEPLOYMENT!
======

## Description
  * Create an AWS account
  * Create an AWS Access Key and Secret
    * add the Access Key and Secret to your `.env` file
  * Create a new model that represents a file type that you want to store on AWS S3
    * ex: `.mp3`, `.mp4`, `.png`, etc
  * Create a test that uploads one of these files to your route
  * Use the `aws-sdk` to assist with uploading
  * Use `multer` to parse the file upload request

## Server Endpoint
  * `POST` - `/api/resource/:resourceID/new-resource`

## Tests
  * `POST` - **200** - test that the upload worked and a resource object is returned

## Bonus
  * `DELETE` route - `/api/resource/:resourceID/new-resource/:new-resourceID`
  * Test: `DELETE` - **204** - test to ensure the object was deleted from s3

## Bonus - DELETE Route Hints
  * Try using the `deleteObject` method provided by the `aws-sdk` to delete an object *(file)* from S3
    * you will need to pass in a `params` object that contains the associated Bucket and AWS object key in order to delete the object from s3
    * ex:
    ``` javascript
    var params = {
      Bucket: 's3-bucket-name',
      Key: 'object-filename'
    }
    s3.deleteObject(params)
    ```
  * Don't forget to remove the resource from the DB
