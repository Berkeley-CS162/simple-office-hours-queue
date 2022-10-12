import { useState } from 'react';
import { Assignment, Location, SiteSettings, SiteSettingsValues } from '@prisma/client';
import { trpc } from '../../utils/trpc';
import { Button, Flex, Input, Spinner, Switch, Text } from '@chakra-ui/react';
import AdminCard from './AdminCard';

/**
 * Component which allows staff to edit the available locations and assignments
 */
const AdminView = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentText, setAssignmentText] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationText, setLocationText] = useState<string>('');
  const [isPendingStageEnabled, setIsPendingStageEnabled] = useState<boolean>(false);

  const createAssignmentMutation = trpc.useMutation('admin.createAssigmnent');
  const editAssignmentMutation = trpc.useMutation('admin.editAssignment');
  const createLocationMutation = trpc.useMutation('admin.createLocation');
  const editLocationMutation = trpc.useMutation('admin.editLocation');
  const setIsPendingStageEnabledMutation = trpc.useMutation('admin.setIsPendingStageEnabled');

  const { isLoading: isAssignmentsLoading } = trpc.useQuery(['admin.getAllAssignments'], {
    refetchOnWindowFocus: false,
    onSuccess: data => {
      setAssignments(data);
    },
  });

  const { isLoading: isLocationsLoading } = trpc.useQuery(['admin.getAllLocations'], {
    refetchOnWindowFocus: false,
    onSuccess: data => {
      setLocations(data);
    },
  });

  const { isLoading: isGetPendingStageLoading } = trpc.useQuery(['admin.getIsPendingStageEnabled'], {
    refetchOnWindowFocus: false,
    onSuccess: data => {
      if (data?.value === SiteSettingsValues.TRUE) {
        setIsPendingStageEnabled(true);
      } else {
        setIsPendingStageEnabled(false);
      }
    },
  });

  const handleCreateAssignment = async () => {
    const data = await createAssignmentMutation.mutateAsync({ name: assignmentText });
    setAssignments(prev => [...prev, data]);
  };

  const handleCreateLocation = async () => {
    const data = await createLocationMutation.mutateAsync({ name: locationText });
    setLocations(prev => [...prev, data]);
  };

  // Sets the pending stage to enabled or disabled depending on the current state
  const handleTogglePendingStageEnabled = async () => {
    setIsPendingStageEnabled(prev => !prev);
    const valueToSet = isPendingStageEnabled ? SiteSettingsValues.FALSE : SiteSettingsValues.TRUE;
    console.log(valueToSet);
    await setIsPendingStageEnabledMutation.mutateAsync({
      setting: SiteSettings.isPendingStageEnabled,
      value: valueToSet,
    });
  };

  return (
    <>
      {isAssignmentsLoading || isLocationsLoading ? (
        <Spinner />
      ) : (
        <Flex m={10} flexDirection='column'>
          <Flex direction='column' w='50%' mb={3}>
            <Text fontSize='3xl' fontWeight='semibold'>
              Assignments
            </Text>
            <Flex>
              <Input onChange={e => setAssignmentText(e.target.value)} value={assignmentText} placeholder='Gitlet' />
              <Button onClick={handleCreateAssignment} ml={3}>
                Create
              </Button>
            </Flex>
          </Flex>
          {assignments.map(assignment => (
            <AdminCard key={assignment.id} assignmentOrLocation={assignment} editMutation={editAssignmentMutation} />
          ))}

          <Flex direction='column' w='50%' mt={10} mb={3}>
            <Text fontSize='3xl' fontWeight='semibold'>
              Locations
            </Text>
            <Flex>
              <Input onChange={e => setLocationText(e.target.value)} value={locationText} placeholder='Woz' />
              <Button onClick={handleCreateLocation} ml={3}>
                Create
              </Button>
            </Flex>
          </Flex>
          {locations.map(location => (
            <AdminCard key={location.id} assignmentOrLocation={location} editMutation={editLocationMutation} />
          ))}

          <Flex direction='column' w='50%' mt={10} mb={3}>
            <Text fontSize='3xl' fontWeight='semibold'>
              General Settings
            </Text>
            <Flex>
              <Text fontSize='xl'>Pending Stage</Text>
              {isGetPendingStageLoading ? (
                <Spinner />
              ) : (
                <Switch ml={2} mt={2} isChecked={isPendingStageEnabled} onChange={handleTogglePendingStageEnabled} />
              )}
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default AdminView;
