import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by Ant Desgin"
      links={[
        {
          key: 'API Gateway',
          title: 'API Gateway',
          href: 'https://github.com/roc80/api-gateway-frontend',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/roc80',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
