"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MessageSquare, Star, MapPin, Building } from "lucide-react";

interface Mentor {
  _id: string;
  name: string;
  email?: string;
  role: string;
  company: string;
  location: string;
  expertise: string[];
  experience: string;
  bio: string;
  availability: string;
  rating: number;
  mentees: number;
  isVerified: boolean;
}

interface Mentee {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  skills?: string[];
  location?: string;
}

interface ConnectionRequest {
  _id: string;
  opportunityId: string;
  userId: string;
  status: "pending" | "accepted" | "rejected";
  appliedDate: number;
  coverLetter?: string;
  opportunity: {
    _id: string;
    title: string;
    description: string;
    type: string;
    postedDate: number;
  };
}

export default function MentorDashboard() {
  const { isLoaded, userId } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Get mentor profile
  const mentorProfile = useQuery(api.mentors.getMentorProfile, {});
  
  // Get all mentors for comparison/stats
  const allMentors = useQuery(api.mentors.getAllMentors, {});

  // Get mentees (when mentor profile is loaded)
  const mentees = useQuery(
    api.mentors.getMentees,
    mentorProfile ? { mentorId: mentorProfile._id } : "skip"
  );

  // Get connection requests (when mentor profile is loaded)
  const connectionRequests = useQuery(
    api.mentors.getConnectionRequests,
    mentorProfile ? { mentorId: mentorProfile._id } : "skip"
  );

  if (!isLoaded || !userId) {
    return <div>Loading...</div>;
  }

  if (!mentorProfile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Mentor Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                You need to create a mentor profile first to access the mentor dashboard.
              </p>
              <Button>Create Mentor Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menteesList = (mentees ?? []).filter(
    (m): m is Exclude<typeof m, null> => m !== null
  );

  const handleAcceptRequest = (requestId: string) => {
    // TODO: Implement accept request logic
    console.log("Accept request:", requestId);
  };

  const handleRejectRequest = (requestId: string) => {
    // TODO: Implement reject request logic
    console.log("Reject request:", requestId);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {mentorProfile.name}!
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {mentorProfile.isVerified && (
            <Badge variant="default" className="bg-green-500">
              Verified Mentor
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{mentorProfile.mentees}</p>
                <p className="text-sm text-muted-foreground">Active Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{mentorProfile.rating}</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {connectionRequests?.filter(r => r.status === "pending").length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{mentorProfile.availability}</p>
                <p className="text-sm text-muted-foreground">Availability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mentees">Mentees</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mentor Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback>{mentorProfile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{mentorProfile.name}</h3>
                    <p className="text-muted-foreground">{mentorProfile.role}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">{mentorProfile.company}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{mentorProfile.location}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentorProfile.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground">{mentorProfile.bio}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectionRequests?.slice(0, 5).map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.opportunity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Applied {new Date(request.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={request.status === "pending" ? "default" : 
                                request.status === "accepted" ? "default" : "secondary"}
                        className={request.status === "accepted" ? "bg-green-500" : ""}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                  {(!connectionRequests || connectionRequests.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mentees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Mentees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menteesList.map((mentee) => (
                  <div key={mentee._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{mentee.name}</h4>
                        <p className="text-sm text-muted-foreground">{mentee.email}</p>
                        <p className="text-sm">{mentee.role}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
                {menteesList.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No mentees yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectionRequests?.map((request) => (
                  <div key={request._id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{request.opportunity.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.opportunity.description}
                        </p>
                        {request.coverLetter && (
                          <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                            "{request.coverLetter}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Applied {new Date(request.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge 
                          variant={request.status === "pending" ? "default" : 
                                  request.status === "accepted" ? "default" : "secondary"}
                          className={request.status === "accepted" ? "bg-green-500" : ""}
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleAcceptRequest(request._id)}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRejectRequest(request._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {(!connectionRequests || connectionRequests.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No connection requests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Profile editing functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}