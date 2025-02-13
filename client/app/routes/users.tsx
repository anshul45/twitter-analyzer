/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-unresolved */
import { Table, Button, Spin, Flex, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { getUsers, addUser, removeUser } from '~/common/api.request';
import { ColumnType } from 'antd/es/table';

interface Users {
  Username: string;
  id: string;
}

const UserTable = () => {
  const [data, setData] = useState<Users[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [username,setUsername] = useState<string>("");

  const getUsernames = async () => {
    setLoading(true);
    try {
      const response = await getUsers();  
      const usersWithKeys = response?.map((user) => ({
        ...user,
        key: user.id,
      }));
      setData(usersWithKeys);
    } catch (error) {
      console.error('Failed to fetch summaries:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdd = async () => {
    if (!username) {
      message.error("Please enter username");
      return;
    }
    try {
      await addUser(username);
      message.success("User added successfully");
      setUsername(''); 
      getUsernames(); 
    } catch (error) {
      message.error("Failed to add user");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeUser(id); 
      message.success("User removed successfully");
      getUsernames();
    } catch (error) {
      message.error("Failed to remove user");
    }
  };
  
  useEffect(() => {
    getUsernames();
  }, []);

  const columns: ColumnType<Users>[] = [
    {
      title: 'Users',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      fixed: 'left' as const,
    },
    {
      title: 'Profile',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (username) => (
        <Button
          type="link"
          onClick={() => window.open(`https://x.com/${username}`, '_blank')}
        >
          {username}
        </Button>
      ),
    },    
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'id',
      width: 400,
      render: (id) => (
        <>
        <Button variant='solid' color='danger' onClick={() => handleRemove(id)}>
        Remove User
      </Button>
        </>
      ),
    },
  ];

  return (
    <div className="w-full px-5">
      {loading ? (
        <Flex justify='center' align='center' className='h-[calc(100vh-65px)]'>
          <Spin size="large" />
        </Flex>
      ) : (
        <div>
            <Flex align='center' className='w-[40%] my-3' gap={30}>
            <Input
  className='h-11'
  placeholder='Enter Username'
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
        <Button className='h-10' variant='solid' color='default' disabled={!username} onClick={handleAdd}>Add User</Button>
        
            </Flex>
            <Table dataSource={data} columns={columns}
          pagination={{
          position: ['bottomCenter'],
          pageSize: 6,
          showSizeChanger: false
        }}/>
        </div>
      )}
    </div>
  );
};

export default UserTable;
