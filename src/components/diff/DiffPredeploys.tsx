import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Address, getAddress } from 'viem';
import { Markdown } from '@/components/diff/utils/Markdown';
import { References } from '@/components/diff/utils/References';
import { RenderDiff } from '@/components/diff/utils/RenderDiff';
import { Copyable } from '@/components/ui/Copyable';
import { classNames } from '@/lib/utils';
import { Predeploy } from '@/types';

type Props = {
  base: Predeploy[];
  target: Predeploy[];
  onlyShowDiff: boolean;
};

const Abi = ({ predeploy }: { predeploy: Predeploy }) => {
  const hasProxyAbi = 'proxyAbi' in predeploy && predeploy.proxyAbi.length > 0;
  const hasLogicAbi = 'logicAbi' in predeploy && predeploy.logicAbi.length > 0;
  const hasLogicAddress = 'logicAddress' in predeploy && predeploy.logicAddress.length > 0;

  let proxyAbi = <></>;
  let logicAbi = <></>;

  if (!hasProxyAbi) {
    proxyAbi = <p className='text-sm'>ABI not found.</p>;
  } else if (hasProxyAbi) {
    proxyAbi = (
      <ul>
        {predeploy.proxyAbi.map((sig) => (
          <li key={sig} className='my-2 text-xs'>
            <code>{sig}</code>
          </li>
        ))}
      </ul>
    );
  }

  if (!hasLogicAbi) {
    logicAbi = <p className='text-sm'>ABI not found.</p>;
  } else if (hasLogicAbi) {
    logicAbi = (
      <ul>
        {predeploy.logicAbi.map((sig) => (
          <li key={sig} className='my-2 text-xs'>
            <code>{sig}</code>
          </li>
        ))}
      </ul>
    );
  }

  const proxyAbiContent = (
    <>
      <div className='font-semibold'>Proxy Contract ABI</div>
      {proxyAbi}
      <div className='mt-4 font-semibold'>Logic Contract ABI</div>
      <div className='text-secondary text-sm'>
        {hasLogicAddress && (
          <div className='mt-2 flex flex-1 items-center'>
            {/* For some reason the text is not horizontally aligned so we manually add some margin to fix it */}
            <div className='mr-1' style={{ marginBottom: '0.2rem' }}>
              Implementation at
            </div>
            <Copyable
              content={formatAddress(predeploy.logicAddress)}
              textToCopy={predeploy.logicAddress}
            />
          </div>
        )}
      </div>
      {logicAbi}
    </>
  );

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={classNames(
              'flex items-center text-sm',
              open ? 'text-secondary my-2' : 'text-zinc-300 dark:text-zinc-600'
            )}
          >
            ABI
            <ChevronRightIcon
              className={classNames('h-5 w-5', open ? 'rotate-90 transform' : '')}
            />
          </Disclosure.Button>
          <Disclosure.Panel className={open ? 'mb-2' : ''}>
            {hasProxyAbi ? proxyAbiContent : logicAbi}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

const formatPredeploy = (predeploy: Predeploy | undefined) => {
  if (!predeploy) return <p>Not present</p>;
  return (
    <>
      <p>
        <Markdown codeSize='0.9rem' content={predeploy.name} />
      </p>
      <p className='text-secondary text-sm'>
        <Markdown content={predeploy.description} />
      </p>
      <div className='mt-4'>
        <Abi predeploy={predeploy} />
        <References references={predeploy.references} />
      </div>
    </>
  );
};

const formatAddress = (addr: Address) => {
  addr = getAddress(addr);
  return <code className='text-sm'>{`${addr.slice(0, 6)}...${addr.slice(-4)}`}</code>;
};

export const DiffPredeploys = ({ base, target, onlyShowDiff }: Props) => {
  // Generate a sorted list of all predeploys from both base and target.
  const sortedAddrs = [
    ...base.map((p) => getAddress(p.address)),
    ...target.map((p) => getAddress(p.address)),
  ].sort((a, b) => a.localeCompare(b));
  const predeployAddrs = [...new Set(sortedAddrs)];

  const diffContent = (
    <>
      {predeployAddrs.map((addr) => {
        const basePredeploy = base.find((p) => getAddress(p.address) === addr);
        const targetPredeploy = target.find((p) => getAddress(p.address) === addr);

        const isEqual = JSON.stringify(basePredeploy) === JSON.stringify(targetPredeploy);
        const showPredeploy = !isEqual || !onlyShowDiff;

        return (
          showPredeploy && (
            <div
              key={addr}
              className='grid grid-cols-12 items-center border-b border-zinc-500/10 py-6 dark:border-zinc-500/20'
            >
              <div className='col-span-2'>
                <Copyable content={formatAddress(addr)} textToCopy={addr} />
              </div>
              <div className='col-span-5 pr-4'>{formatPredeploy(basePredeploy)}</div>
              <div className='col-span-5'>{formatPredeploy(targetPredeploy)}</div>
            </div>
          )
        );
      })}
    </>
  );

  return <RenderDiff content={diffContent} />;
};
