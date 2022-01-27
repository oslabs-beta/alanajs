import iam from '../methods/AWS/iam.js';
import { AwsRole } from '../methods/util/aws.js';
import { verifyRole } from '../util/verifyAWS';
import { intro, starting, error, fail, finished, code } from '../methods/util/chalkColors.js';

const roles = async (role, options) => {
  if (options.delete) {
    if (role === AwsRole) {
      console.log(fail('Cannot delete default role. Change default role before deleting'));
      return;
    }
    let data;
    if (options.role) data = await iam.deleteRole(options.role);
    if (!options.role && role !== AwsRole) data = await iam.deleteRole(role);
    if (data) console.log(finished(`  AWS role '${options.role || role}' deleted.`));
    return;
  }
  if (options.list) console.log(await iam.getRoleList());
  if (options.role) await verifyRole(options.role, options.create);
  if (!options.role && role !== AwsRole) await verifyRole(role, options.create);
};

export default roles;