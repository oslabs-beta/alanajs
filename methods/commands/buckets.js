import s3 from '../AWS/s3.js';
import { AwsBucket } from '../util/aws.js';
import { verifyBucket } from '../util/verifyAWS.js';
import { intro, starting, error, fail, finished, code } from '../util/chalkColors.js';

const buckets = async (s3bucket, options) => {
  // console.log(await s3.getBucketList());
  if (options.delete) {
    if (s3bucket === AwsBucket) {
      console.log(fail('Cannot delete default bucket. Change default bucket before deleting'));
      return;
    }
    let data;
    if (options.bucket) data = await s3.deleteBucket(options.bucket);
    if (!options.bucket && s3bucket !== AwsBucket) data = await s3.deleteBucket(s3bucket);
    if (data) console.log(finished(`  S3 bucket '${options.bucket || s3bucket}' deleted.`));
    return;
  }
  if (options.list) console.log(await s3.getBucketList());
  if (options.bucket) await verifyBucket(options.bucket, options.create);
  if (!options.bucket && s3bucket !== AwsBucket) await verifyBucket(s3bucket, options.create);
};

export default buckets;