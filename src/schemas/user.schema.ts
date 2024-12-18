import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Gender } from 'src/common/enums/gender.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { Post } from './post.schema';
import { UserSettings } from './user-settings.schema';

@Schema({ timestamps: true })
export class User {
  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  username: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    required: false,
  })
  profilePic?: string;

  @Prop({
    enum: Gender,
  })
  gender?: Gender;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  /* NOTE: This field will actually hold an ObjectID value which we can populate with the associated 'UserSettings' document using the 'populate()' method */
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSettings',
  })
  settings?: UserSettings;

  /* NOTE: This field will actually hold an array of ObjectIDs, which we can populate with the associated 'Post' documents using the 'populate()' method */
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  })
  posts: Post[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserWithTimestamps = User & {
  _id: string | mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type UserModelFields = keyof UserWithTimestamps;

export type UserModelProjection = ProjectionFieldsOf<UserWithTimestamps>;
