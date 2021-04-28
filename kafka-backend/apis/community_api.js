import { createError } from '../helper/error';

const CommunityModel = require('../models/communityModel');
var ObjectId = require('mongodb').ObjectID;

export async function createCommunity(message, callback) {
  let response = {};
  console.log('Inside create user post Request');
  let community = message.body.community;
  console.log('Community Creation ', JSON.stringify(community));
  try {
    community = await insertCommunity(community);
  } catch (error) {
    console.log('error in creting community', JSON.stringify(error));

    let err = createError(
      500,
      'Unable to create community. Please check application logs for more detail.'
    );
    console.log('Error code ', error.code);

    if (error.code == 11000) {
      console.log('comming here');
      err = createError(
        400,
        'Community name already exists. Please enter unique name.'
      );
    }
    return callback(err, null);
  }

  response.status = 200;
  response.data = community;
  return callback(null, response);
}

async function insertCommunity(community) {
  console.log('Inside insert Community');
  var community = new CommunityModel(community);
  return await community.save();
}

export async function updateExistingCommunity(message, callback) {
  let response = {};
  let err = {};
  console.log('Inside update community post Request api');
  let community = message.body.community;
  console.log('Community Updation ', JSON.stringify(community));
  try {
    const storedCommunity = await getCommunityByObjectID(community._id);

    if (!storedCommunity) {
      err = createError(
        400,
        'Community ID invalid. Please provide correct community ID to update'
      );
      return callback(err, null);
    } else {
      community = await updateCommunity(community);
    }
  } catch (error) {
    console.log('error in update', error);
    err.status = 500;
    err.data = {
      code: err.code,
      msg:
        'Unable to successfully update the community! Please check the application logs for more details.',
    };
    return callback(err, null);
  }
  response.status = 200;
  response.data = community;
  console.log('response for update ', community);
  return callback(null, response);
}

async function getCommunityByObjectID(communityId) {
  const community = CommunityModel.findOne({ _id: communityId });
  return community;
}

async function updateCommunity(community) {
  console.log('Inside update community');
  const value = await CommunityModel.findOneAndUpdate(
    { _id: ObjectId(community._id) },
    { ...community },
    { new: true }
  );
  await value.save();
  return value;
}

export async function getAllCommunityForUser(message, callback) {
  let response = {};
  let error = {};
  const userId = message.userId;

  console.log('Inside get all community list Request');
  try {
    const communities = await getCommunityByUserId(userId);

    console.log('communitiesX ', JSON.stringify(communities));
    return callback(null, { status: 200, data: communities });
  } catch (err) {
    console.log(err);
    error.status = 500;
    error.data = {
      code: err.code,
      msg:
        'Unable to successfully get all the Communities! Please check the application logs for more details.',
    };
    return callback(error, null);
  }
}

async function getCommunityByUserId(userId) {
  console.log('Inside get Community By User ID XX ', userId);
  const result = await CommunityModel.find({
    members: { $elemMatch: { _id: userId } },
  })
    .populate('members._id')
    .populate('creator')
    .populate('posts');
  console.log('ResultsX ', JSON.stringify(result));
  return result;
}

export async function getCommunityDetails(message, callback) {
  let response = {};
  let error = {};
  console.log("inside get community details", message.communityId);
  let communityId = message.communityId;
  console.log("Inside get communityId details Request");
  try {
    const communityDetail = await getCommunityById(communityId);
    response.status = 200;
    response.data = communityDetail;
    return callback(response, null);
  } catch (err) {
    console.log(err);
    error.status = 500;
    error.data = {
      code: err.code,
      msg:
        'Unable to successfully get the Community! Please check the application logs for more details.',
    }
    return callback(error, null);
  }
}

async function getCommunityById(communityId) {
  const community = await CommunityModel.findOne(
    { _id: communityId }
  ).populate('members._id')
    .populate('creator')
    .populate('posts');
  return community;
}