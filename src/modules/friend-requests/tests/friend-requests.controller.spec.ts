import { Test, TestingModule } from '@nestjs/testing';
import { Services } from '@/constants/constants';
import { mockUser } from '@/__mocks__';
import { IFriendRequestService } from '../friend-requests';
import { FriendRequestController } from '../friend-requests.controller';

describe('FriendRequestsController', () => {
  let controller: FriendRequestController;
  let friendRequestService: IFriendRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendRequestController],
      providers: [
        {
          provide: Services.FRIENDS_REQUESTS_SERVICE,
          useValue: {
            getFriendRequests: jest.fn((x) => x),
            create: jest.fn((x) => x),
          },
        },
      ],
    }).compile();

    controller = module.get<FriendRequestController>(FriendRequestController);
    friendRequestService = module.get<IFriendRequestService>(
      Services.FRIENDS_REQUESTS_SERVICE,
    );
    jest.clearAllMocks();
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
    expect(friendRequestService).toBeDefined();
  });

  it('should call friendRequestService.getFriendRequests', async () => {
    await controller.getFriendRequests({ user: mockUser });
    expect(friendRequestService.getFriendRequests).toHaveBeenCalled();
    expect(friendRequestService.getFriendRequests).toHaveBeenCalledWith(
      mockUser._id.toString(),
    );
  });

  it('should call createFriendRequest with correct params', async () => {
    await controller.createFriendRequest(
      { user: mockUser },
      {
        request_id: 'xxxxxxxxxxxxxxxxxxxxxxx',
      },
    );
    expect(friendRequestService.create).toHaveBeenCalledWith({
      user: mockUser,
      request_id: 'xxxxxxxxxxxxxxxxxxxxxxx',
    });
  });
});
