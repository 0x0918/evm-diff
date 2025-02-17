import { Markdown } from '@/components/diff/utils/Markdown';
import { References } from '@/components/diff/utils/References';
import { RenderDiff } from '@/components/diff/utils/RenderDiff';
import { Copyable } from '@/components/ui/Copyable';
import { AccountType } from '@/types';

type Props = {
  base: AccountType[];
  target: AccountType[];
  onlyShowDiff: boolean;
};

const formatAccountType = (contents: AccountType | undefined) => {
  if (!contents) return <p>Not present</p>;
  return (
    <>
      <p>
        <Markdown content={contents.description} />
      </p>
      <div className='mt-4 text-sm'>
        {Object.entries(contents.properties).map(([key, value]) => {
          // Return a two column table of the property name and description.
          return (
            <div key={key} className='grid grid-cols-2 space-y-1'>
              <div className='col-span-1'>
                {key === 'canBatchTxs' && 'Can batch transactions'}
                {key === 'canInitiateTxs' && 'Can initiate transactions'}
                {key === 'hasCode' && 'Has code'}
                {key === 'hasKeyPair' && 'Has key pair'}
                {key === 'hasStorage' && 'Has storage'}
              </div>
              <div className='col-span-1'>{value ? 'Yes' : 'No'}</div>
            </div>
          );
        })}
      </div>

      <References className='mt-4' references={contents.references} />
    </>
  );
};

export const DiffAccountTypes = ({ base, target, onlyShowDiff }: Props) => {
  // Generate a sorted list of all account types from both base and target.
  const sortedAccountTypeNames = [...base.map((a) => a.name), ...target.map((a) => a.name)].sort(
    (a, b) => a.localeCompare(b)
  );
  const accountTypeNames = [...new Set(sortedAccountTypeNames)];

  const diffContent = (
    <>
      {accountTypeNames.map((name) => {
        const baseAccountType = base.find((a) => a.name === name);
        const targetAccountType = target.find((a) => a.name === name);

        const isEqual = JSON.stringify(baseAccountType) === JSON.stringify(targetAccountType);
        const showAccountType = !isEqual || !onlyShowDiff;

        return (
          showAccountType && (
            <div
              key={name}
              className='grid grid-cols-12 items-center border-b border-zinc-500/10 py-6 dark:border-zinc-500/20'
            >
              <div className='col-span-2'>
                <Copyable content={name} />
              </div>
              <div className='col-span-5 pr-4'>{formatAccountType(baseAccountType)}</div>
              <div className='col-span-5'>{formatAccountType(targetAccountType)}</div>
            </div>
          )
        );
      })}
    </>
  );

  return <RenderDiff content={diffContent} />;
};
