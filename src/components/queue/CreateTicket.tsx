import { useState, useRef } from 'react';
import { trpc } from '../../utils/trpc';
import { Select } from 'chakra-react-select';
import Router from 'next/router';
import { Flex, Box, FormControl, Input, FormLabel, Button, useToast, Text } from '@chakra-ui/react';

interface Assignment {
  id: number;
  label: string;
  value: string;
}

interface Location {
  id: number;
  label: string;
  value: string;
}

/**
 * CreateTicket component that allows studnets to create a new ticket
 */
const CreateTicketForm = () => {
  const [description, setDescription] = useState<string>('');
  const [assignment, setAssignment] = useState<Assignment>();
  const [assignmentOptions, setAssignmentOptions] = useState<Assignment[]>([]);
  const [locationOptions, setLocationOptions] = useState<Location[]>([]);
  const [location, setLocation] = useState<Location>();
  const toast = useToast();

  const createTicketMutation = trpc.ticket.createTicket.useMutation();
  trpc.admin.getActiveAssignments.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess: data => {
      setAssignmentOptions(
        data.map(assignment => ({ label: assignment.name, value: assignment.name, id: assignment.id } as Assignment)),
      );
    },
  });
  trpc.admin.getActiveLocations.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess: data => {
      setLocationOptions(
        data.map(location => ({ label: location.name, value: location.name, id: location.id } as Location)),
      );
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assignment || !location) {
      toast({
        title: 'Error',
        description: 'Please select an assignment and location',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    await createTicketMutation
      .mutateAsync({
        description: description.trim(),
        assignmentId: assignment.id,
        locationId: location.id,
      })
      .then(ticket => {
        if (!ticket) {
          toast({
            title: 'Error',
            description: 'Could not create ticket. You may already have a ticket open.',
            status: 'error',
            position: 'top-right',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        setDescription('');
        // Resets the select options
        setAssignment('' as unknown as Assignment);
        setLocation('' as unknown as Location);
        toast({
          title: 'Ticket created',
          description: 'Your help request has been created',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        Router.push(`/ticket/${ticket?.id}`);
      });
  };

  return (
    <Box p={8} width='full' borderWidth={1} borderRadius={8} boxShadow='lg'>
      <Box my={4} textAlign='left'>
        <form onSubmit={onSubmit}>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              type='text'
              placeholder='Null Pointer Exception'
              name='description'
            />
          </FormControl>
          <FormControl mt={6} isRequired>
            <FormLabel>Assignment</FormLabel>
            <Select value={assignment} onChange={val => setAssignment(val!)} options={assignmentOptions} />
          </FormControl>
          <FormControl mt={6} isRequired>
            <FormLabel>Location</FormLabel>
            <Select value={location} onChange={val => setLocation(val!)} options={locationOptions} />
          </FormControl>
          <Button type='submit' variant='outline' width='full' mt={4}>
            Request Help
          </Button>
        </form>
      </Box>
    </Box>
  );
};

const CreateTicket = () => {
  const endOfForm: any = useRef<HTMLSpanElement>();

  return (
    <Flex width='full' align='left' flexDir='column' p={10}>
      <Text fontSize='2xl' mb={5}>
        Welcome back. Create a ticket to get started or{' '}
        <Box
          as='span'
          className='hover-cursor'
          border='1px'
          borderRadius={8}
          p='3px'
          pl='5px'
          pr='5px'
          onClick={() => endOfForm.current.scrollIntoView()}
        >
          view the queue
        </Box>
      </Text>
      <CreateTicketForm />
      <span ref={endOfForm}></span> {/* Start of queue */}
    </Flex>
  );
};

export default CreateTicket;
