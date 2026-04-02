# BondHub PRD (2026-04-01)

---

# Part 1: Basic Information

## Title

BondHub

## Terminology

| Term          | Definition                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Community     | A group organized around a shared interest or topic where users can share posts                                            |
| Post          | Content shared by a user within a community, consisting of a title (max 100 characters) and text body (max 300 characters) |
| Member        | A user who has joined a specific community                                                                                 |
| Feed          | A personalized stream of posts from communities joined or users followed                                                   |
| Follow        | Action of subscribing to another user's content to see their posts in your feed                                            |
| Category      | A classification assigned to a community for easier discovery and filtering                                                |
| Flag          | A user-submitted report marking content (post or comment) as inappropriate for admin review                                |
| Rate Limiting | System-enforced throttle on post/comment creation to prevent spam                                                          |

## Project Information

### Description

BondHub is a community-based social platform focused on local community building with interest-based groups. The platform emphasizes quality connections over quantity, providing a streamlined interface that encourages meaningful interactions within topic-focused communities.

### Goals

1. Enable users to discover and join interest-based communities
2. Facilitate meaningful content sharing and discussions within communities
3. Build social connections through following and engaging with other users

### User Types

- **User (Community Member)**: Can create profile, join communities, create posts, edit/delete own posts, comment on posts, follow other users, flag inappropriate content
- **Admin**: Full platform management, user moderation, community creation/oversight, content moderation, community category management

### User Relationships

- User to User: Many-to-Many (following/followers relationship)
- User to Admin: Independent (Admin manages all users)

### Project Type

- Web Application - React
- Admin Dashboard - React

## System Modules (Step-by-step Flows)

### Module 1 - Community Joining

1. User browses available communities from the community list page
2. User clicks on a community to view its details and recent posts
3. User clicks "Join Community" button
4. System adds user to community member list
5. User can now post and comment within the community

### Module 2 - Post Creation

1. User navigates to a joined community
2. User clicks "Create Post" button
3. User enters post title (max 100 characters) and content (max 300 characters) in the form
4. User clicks "Submit"
5. System validates content (rate limiting applied) and creates the post
6. Post appears in community feed, visible to all community members

### Module 4 - Post Edit/Delete

1. User views their own post
2. User clicks "Edit" or "Delete" button
3. If Edit: User modifies title/content, clicks "Save" — system updates the post
4. If Delete: System shows confirmation dialog, user confirms — post is removed

### Module 5 - Content Flagging

1. User views a post or comment with inappropriate content
2. User clicks "Flag" / "Report" button
3. System records the flag and notifies admin
4. Admin reviews flagged content from the admin dashboard
5. Admin takes action (delete content, suspend user, or dismiss flag)

### Module 3 - User Following

1. User views another user's profile
2. User clicks "Follow" button
3. System creates following relationship
4. Followed user's posts appear in User's personalized feed

## 3rd Party API List

- None (Level 1 - simple project)

---

# Part 2: User Application PRD

## User Types: User (Community Member)

## 1. Common

### Splash Page

- Design: BondHub logo with teal (#14B8A6) accent
- Auto-redirect to Login page after loading

### Login Page

- **Input**:
  - Email (required)
  - Password (required)
- **Next Action**:
  - Validate email format
  - Authenticate credentials
  - Error: Display "Invalid email or password"
  - Success: Redirect to Home Feed

### Forgot Password Page

- **Main**
  - Input: Email address
  - Action: Send password reset link
- **Reset Password Page**
  - Input: New password, Confirm password
  - Validation: Password match check
  - Success: Redirect to Login page

### Sign Up Page

- **Input**:
  - Email (required)
  - Password (required)
  - Display Name (required)
  - Profile bio (optional)
  - Profile picture (optional)
- **Rules**:
  - Email must be unique
  - Password minimum 8 characters
  - Display Name minimum 2 characters

## 2. User (Community Member)

### 2.1 Navigation Menu

1. Home (Feed)
2. Communities
3. Profile
4. Settings

### 2.2 Page Architecture & Feature Specification

#### 1. Home Tab

**Main Page (Feed)**

1. Personalized Feed
   - Display posts from joined communities
   - Display posts from followed users
   - Chronological order (newest first)
   - Each post shows: Title, content preview, author, community, timestamp

2. Post Card Component
   - Author avatar and display name
   - Community name tag
   - Post title
   - Content preview (truncated)
   - Comment count indicator
   - Tap to view full post

**Post Detail Page**

- Full post content display
- Author information with follow button
- Post actions (for post author only):
  - Edit post button
  - Delete post button (with confirmation)
- Flag/Report button (for non-authors) to report inappropriate content
- Comment section
  - List of comments (chronological)
  - Comment input field (rate limited)
  - Submit comment button
  - Flag button per comment to report inappropriate content
- Back navigation

**Edit Post Page**

- Post title input (max 100 characters, pre-filled)
- Post content input (max 300 characters, pre-filled)
- Save button
- Cancel button
- Validation: Title and content required

#### 2. Communities Tab

**Main Page (Community List)**

1. Community Browser
   - List of all available communities
   - Each community card shows:
     - Community name
     - Category tag
     - Member count
     - Brief description
   - "Join" / "Joined" button per community

2. Search/Filter
   - Search bar for community name
   - Filter by category

**Community Detail Page**

- Community header
  - Name
  - Category
  - Description
  - Member count
  - Join/Leave button
- Community feed
  - Posts within this community
  - Chronological order
- Create Post button (for members only)

**Create Post Page**

- Post title input (max 100 characters)
- Post content input (max 300 characters, text body)
- Submit button (rate limited)
- Cancel button
- Validation: Title and content required

#### 3. Profile Tab

**Main Page (My Profile)**

1. Profile Header
   - Profile picture
   - Display name
   - Bio
   - Edit Profile button
   - Following count (tap to view list)
   - Followers count (tap to view list)

2. My Posts Section
   - List of posts created by user
   - Chronological order
   - Tap to view post detail

**Edit Profile Page**

- Profile picture upload
- Display name input
- Bio input
- Save button
- Cancel button

**Following/Followers List Page**

- List of users
- Each item shows avatar, display name
- Follow/Unfollow button
- Tap to view user profile

**Other User Profile Page**

- Profile header (same as My Profile, no edit)
- Follow/Unfollow button
- User's posts section

#### 4. Settings Tab

**Main Page**

1. Account Settings
   - Change password
   - Email settings

2. Notification Settings
   - TBD - Client confirmation needed (No push notifications specified)

3. App Settings
   - Logout button

4. About
   - Terms of Service
   - Privacy Policy
   - App version

---

# Part 3: Admin Dashboard PRD

## Admin Dashboard Standard Features

All admin dashboard pages should include the following standard features unless otherwise specified.

### List Page Standard Features

| Feature                | Description                                              | Required |
| ---------------------- | -------------------------------------------------------- | :------: |
| **Search**             | Keyword search field (name, ID, email, etc.)             |   Yes    |
| **Filters**            | Status / Date / Category dropdown filters                |   Yes    |
| **Column Sorting**     | Click table header to sort ASC/DESC                      |   Yes    |
| **Checkbox Selection** | Row checkboxes + Select All checkbox                     |   Yes    |
| **Bulk Actions**       | Bulk delete / Status change / Export for selected items  |   Yes    |
| **Pagination**         | Page navigation + Items per page selector (10/25/50/100) |   Yes    |

### Table UI Standard Features

| Feature           | Description                                 | Required |
| ----------------- | ------------------------------------------- | :------: |
| **Loading State** | Skeleton or spinner while data loads        |   Yes    |
| **Empty State**   | Message displayed when no data exists       |   Yes    |
| **Action Column** | Edit / Delete / View Detail buttons per row |   Yes    |

### Detail/Edit Standard Features

| Feature                 | Description                            | Required |
| ----------------------- | -------------------------------------- | :------: |
| **Detail Drawer/Modal** | Click row to open detail panel         |   Yes    |
| **Edit Form**           | Switch to edit mode within detail view |   Yes    |
| **Delete Confirmation** | Confirmation dialog before deletion    |   Yes    |
| **Audit Log**           | Track who/when/what was modified       | Optional |

### Data Export Standard Features

| Feature                  | Description                              | Required |
| ------------------------ | ---------------------------------------- | :------: |
| **CSV/Excel Download**   | Export current filtered/searched results |   Yes    |
| **Date Range Selection** | Period filter for export                 |   Yes    |

### Common UI/UX Standard Features

| Feature                 | Description                     | Required |
| ----------------------- | ------------------------------- | :------: |
| **Toast Notifications** | Success/Error feedback messages |   Yes    |
| **Breadcrumb**          | Current location navigation     |   Yes    |
| **Create Modal/Drawer** | Form for adding new items       |   Yes    |

---

## Page Architecture & Feature Specification

### Dashboard Home Page

**Statistics Cards**

- Total Users (with trend indicator)
- Total Communities
- Total Posts
- Active Users (today)

**Period Filter**

- Today / Last 7 days / Last 30 days / Custom date range

**Charts**

- User registration trend (line chart)
- Daily post count (bar chart)

**Recent Activity**

- Recently registered users
- Recently created posts
- Recently created communities

---

## User Management

### User Management Page

**Main Page**

1. Top Area:
   - Search: Keyword search - display name, email
   - Filters: Status (Active/Suspended), Date range
   - Create button -> Creation Modal
   - Bulk Action dropdown: Delete / Suspend / Activate / Export

2. Table Component:
   - Checkbox column (with Select All)
   - Display Name
   - Email
   - Status (Active/Suspended)
   - Communities Joined (count)
   - Posts Created (count)
   - Created At
   - Last Login
   - Action column: View / Suspend / Delete

3. Table Features:
   - Column sorting (click header)
   - Pagination with items per page selector

**Creation Modal**

- Input fields: Email, Display Name, Password
- Create button / Cancel button

**Detail Drawer**

- Header Info: Profile picture, Display name, Email, Bio
- Account Actions:
  - Activate / Suspend account
  - Reset password (issue temporary password)
- User Statistics:
  - Communities joined
  - Posts created
  - Followers/Following count
- Activity Log: Recent user activities
- Timestamps: Created at / Last login / Last modified

---

## Community Management

### Community Management Page

**Main Page**

1. Top Area:
   - Search: Community name
   - Filters: Status (Active/Archived), Date range
   - Create button -> Creation Modal
   - Bulk Action dropdown: Delete / Archive / Export

2. Table Component:
   - Checkbox column (with Select All)
   - Community Name
   - Category
   - Description (truncated)
   - Member Count
   - Post Count
   - Status (Active/Archived)
   - Created At
   - Action column: View / Edit / Archive / Delete

3. Table Features:
   - Column sorting (click header)
   - Pagination with items per page selector

**Creation Modal**

- Input fields: Community Name, Category, Description
- Create button / Cancel button
- Note: Only Admin can create communities

### Category Management Page

**Main Page**

1. Top Area:
   - Search: Category name
   - Create button -> Creation Modal
   - Bulk Action dropdown: Delete / Export

2. Table Component:
   - Checkbox column (with Select All)
   - Category Name
   - Community Count (number of communities in this category)
   - Created At
   - Action column: Edit / Delete

3. Table Features:
   - Column sorting (click header)
   - Pagination with items per page selector

**Creation Modal**

- Input fields: Category Name
- Create button / Cancel button

**Detail Drawer**

- Community Info: Name, Category, Description, Created date
- Statistics: Member count, Post count
- Member List: List of community members
- Recent Posts: Recent posts in this community
- Actions:
  - Edit community details
  - Archive community
  - Delete community (with confirmation)

---

## Content Management

### Post Management Page

**Main Page**

1. Top Area:
   - Search: Post title, author name
   - Filters: Community, Date range, Flagged status
   - Bulk Action dropdown: Delete / Export

2. Table Component:
   - Checkbox column (with Select All)
   - Post Title
   - Author (Display Name)
   - Community
   - Comment Count
   - Flagged (Yes/No)
   - Created At
   - Action column: View / Delete

3. Table Features:
   - Column sorting (click header)
   - Pagination with items per page selector

**Detail Drawer**

- Post Info: Title, Full content, Author, Community
- Comments: List of comments on the post
- Actions:
  - Delete post (with confirmation)
  - Delete individual comments

### Comment Management Page

**Main Page**

1. Top Area:
   - Search: Comment content, author name
   - Filters: Date range, Flagged status
   - Bulk Action dropdown: Delete / Export

2. Table Component:
   - Checkbox column (with Select All)
   - Comment Content (truncated)
   - Author
   - Post Title (link)
   - Flagged (Yes/No)
   - Created At
   - Action column: View / Delete

---

## Flagged Content Management

### Flagged Content Page

**Main Page**

1. Top Area:
   - Search: Content text, author name
   - Filters: Content type (Post/Comment), Date range, Status (Pending/Resolved/Dismissed)
   - Bulk Action dropdown: Delete Content / Dismiss / Suspend User

2. Table Component:
   - Checkbox column (with Select All)
   - Content Type (Post/Comment)
   - Content Preview (truncated)
   - Author
   - Flagged By
   - Flag Count
   - Status (Pending/Resolved/Dismissed)
   - Created At
   - Action column: View / Delete Content / Dismiss / Suspend User

3. Table Features:
   - Column sorting (click header)
   - Pagination with items per page selector

**Detail Drawer**

- Full content display
- Author info with link to user detail
- Flag history: List of users who flagged this content
- Actions:
  - Delete content (with confirmation)
  - Dismiss flag (mark as not inappropriate)
  - Suspend the content author

---

## Export / Data Download

**Data Download**

- User List (CSV/Excel)
- Community List (CSV/Excel)
- Post List (CSV/Excel)
- Filter Options:
  - All time
  - Custom date range
  - Current filtered results

---

# Additional Questions (Client Confirmation Required)

## Required Clarifications

|  #  | Question                                                          | Context                                                                              |
| :-: | :---------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
|  1  | What are the predefined community categories?                     | Admin creates communities with categories — need the initial category list           |
|  2  | What is the rate limit threshold for post/comment creation?       | Client confirmed rate limiting but did not specify limits (e.g., max posts per hour) |
|  3  | Can users delete their own comments, or only their own posts?     | Client confirmed post deletion; comment deletion by author is unclear                |
|  4  | Should there be a reason/description field when flagging content? | Flagging system confirmed but UI detail unclear                                      |

## Recommended Clarifications

|  #  | Question                                                                               | Context                                                    |
| :-: | :------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
|  1  | Is there a flag count threshold that auto-hides content before admin review?           | Would help automate moderation for heavily flagged content |
|  2  | Should edited posts show an "edited" indicator?                                        | Common UX pattern for transparency                         |
|  3  | Can suspended users still log in and view content, or are they fully blocked?          | Posts remain visible but user access level is unclear      |
|  4  | Should admin be able to assign categories to existing communities or only at creation? | Category management flexibility                            |
