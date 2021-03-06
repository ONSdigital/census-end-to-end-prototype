import {autoIncrementId} from './utils';

export const HOUSEHOLD_MEMBERS_STORAGE_KEY = 'household-members';
export const USER_HOUSEHOLD_MEMBER_ID = 'person_me';
export const HOUSEHOLD_MEMBER_TYPE = 'household-member';
export const VISITOR_TYPE = 'visitor';

/**
 * Types
 */
export function person(opts, change) {
  if (opts.firstName === '' || opts.lastName === '') {
    console.log('Unable to create person with data: ',
      opts.firstName,
      !opts.middleName,
      !opts.lastName);
  }
  let fullName = opts.firstName + ' ' + opts.lastName;
  let middleName = opts.middleName || '';
  let memberFound = householdMemberExistByFullName(fullName);
  if (memberFound) {
    let middleNameCheck = JSON.stringify(memberFound['@person'].fullName).split(' ').length;
    if (change && middleNameCheck < 3) {
      return {
        fullName: fullName,
        firstLastName: fullName,
        firstName: opts.firstName,
        middleName: middleName,
        lastName: opts.lastName
      };
    } else {
      memberFound['@person'].fullName = memberFound['@person'].firstName + ' ' + memberFound['@person'].middleName + ' ' + memberFound['@person'].lastName
      memberFound = memberFound['@person'];
      updateHouseholdMember(memberFound, {type: 'household-member'});
      return {
        fullName: opts.firstName + ' ' + middleName + ' ' + opts.lastName,
        firstLastName: fullName,
        firstName: opts.firstName,
        middleName: middleName,
        lastName: opts.lastName
      };
    }
  } else {
    return {
      firstLastName: opts.firstName + ' ' + opts.lastName,
      firstName: opts.firstName,
      middleName: middleName,
      lastName: opts.lastName,
      fullName: opts.firstName + ' ' + opts.lastName
    };
  }
}

/**
 * Storage
 */
export function getUserAsHouseholdMember() {
  return getAllHouseholdMembers().find((member) => {
    return member['@person'].id === USER_HOUSEHOLD_MEMBER_ID;
  });
}

export function deleteUserAsHouseholdMember() {
  deleteHouseholdMember(USER_HOUSEHOLD_MEMBER_ID);
}

export function deleteHouseholdMember(personId) {
  let members = getAllHouseholdMembers().filter((member) => {
    return member['@person'].id !== personId;
  });

  sessionStorage.setItem(HOUSEHOLD_MEMBERS_STORAGE_KEY,
    JSON.stringify(members));
}

export function updateUserAsHouseholdMember(person, memberData) {
  let userAsHouseholdMember = getUserAsHouseholdMember();

  userAsHouseholdMember
    ? updateHouseholdMember({
      ...userAsHouseholdMember['@person'],
      ...person
    }, memberData)
    : addHouseholdMember(person, memberData, USER_HOUSEHOLD_MEMBER_ID);
}

export function updateHouseholdMember(person, memberData) {
  let membersUpdated = getAllHouseholdMembers().map((member) => {
    return member['@person'].id === person.id
      ? {...member, ...memberData, '@person': {...member['@person'], ...person}}
      : member;
  });
  sessionStorage.setItem(HOUSEHOLD_MEMBERS_STORAGE_KEY,
    JSON.stringify(membersUpdated));
}

export function addHouseholdMember(person, memberData, id) {
  let people = getAllHouseholdMembers() || [];
  memberData = memberData || {};

  /**
   * User is always first in the household list
   */
  people[id === USER_HOUSEHOLD_MEMBER_ID ? 'unshift' : 'push']({
    ...memberData,
    type: memberData.type || HOUSEHOLD_MEMBER_TYPE,
    '@person': {
      ...person,
      id: id || 'person' + autoIncrementId('household-members')
    }
  });

  sessionStorage.setItem(HOUSEHOLD_MEMBERS_STORAGE_KEY, JSON.stringify(people));
}

export function getAllHouseholdMembers() {
  return JSON.parse(sessionStorage.getItem(HOUSEHOLD_MEMBERS_STORAGE_KEY)) || [];
}

export function getHouseholdMemberByPersonId(id) {
  return getAllHouseholdMembers().find(function(member) {
    return member['@person'].id === id;
  });
}

export function householdMemberExistByFullName(fullName) {
  return getAllHouseholdMembers().find(function(member) {
    return (member['@person'].firstName.toLowerCase() + ' ' + member['@person'].lastName.toLowerCase() === fullName.toLowerCase());
  });
}

export function getMemberPersonId(member) {
  return member['@person'].id;
}

/**
 * Comparators
 */
export function isVisitor(member) {
  return member.type === window.ONS.storage.KEYS.VISITOR_TYPE;
}

export function isHouseholdMember(member) {
  return member.type === window.ONS.storage.KEYS.HOUSEHOLD_MEMBER_TYPE;
}

export function isOtherHouseholdMember(member) {
  return member.type === window.ONS.storage.KEYS.HOUSEHOLD_MEMBER_TYPE &&
    member['@person'].id !== window.ONS.storage.IDS.USER_HOUSEHOLD_MEMBER_ID;
}

export const tempAwayQuestionSentenceMap = {
  'three-more': 'People who usually live outside the UK who are staying in the UK for <strong>3 months or more</strong>',
  'perm-away': 'People who work away from home within the UK if this is their permanent or family home',
  'armed-forces': 'Members of the armed forces if this is their permanent or family home',
  'less-twelve': 'People who are temporarily outside the UK for less than <strong>12 months</strong>',
  'usually-temp': 'People staying temporarily who usually live in the UK but' +
    ' do not have another UK address for example, relatives, friends',
  'other': 'Other people who usually live here but are temporarily away'
};

export const visitorQuestionSentenceMap = {
  'usually-in-uk': 'People who usually live somewhere else in the UK, for example boy/girlfriends, friends or relatives',
  'second-address': 'People staying here because it is their second address, for example, for work. Their permanent or family home is elsewhere',
  'less-three': 'People who usually live outside the UK who are staying in the UK for less than three months',
  'on-holiday': 'People here on holiday',
};
