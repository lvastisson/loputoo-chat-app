using SocketIOClient;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Web.UI.WebControls;
using System.Windows.Forms;

namespace frontend_app
{
    public partial class Form1 : Form
    {
        public delegate void UpdateLabelMethod(string text, bool error);
        public delegate void UpdateMessagesMethod(string text);
        public static bool isRunning = false;
        public static string sessionToken = "";

        string serverAddress = "http://localhost:5000";

        Random rnd = new Random();

        SocketIO client = null;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void UpdateIpVar()
        {
            if (serverIPTextBox.Text != "")
            {
                serverAddress = serverIPTextBox.Text;
            }
        }


        private async void socketIoManager()
        {
            AddMessage($"socketIoManager called, isrunning: {isRunning}");

            if (isRunning) return;

            isRunning = true;

            try
            {
                client = new SocketIO(serverAddress);
                Debug.WriteLine("past socket initalization");

                client.OnConnected += async (sender, e) =>
                {
                    Debug.WriteLine("ühendatud");
                };

                client.OnDisconnected += async (sender, e) =>
                {
                    UpdateStatus("Disconnected", true);
                };

                client.On("hello", (data) =>
                {
                    Debug.WriteLine(data.GetValue<string>());
                    UpdateStatus(data.GetValue<string>());
                });

                client.On("message", (data) =>
                {
                    AddMessage(data.GetValue<string>());
                });

                await client.ConnectAsync();
            }
            catch
            {
                isRunning = false;
                UpdateStatus("Unable to connect, will keep retrying...", true);
                await Task.Delay(3000);
                socketIoManager();
            }
        }

        private void UpdateStatus(string text, bool error = false)
        {
            if (this.label1.InvokeRequired)
            {
                UpdateLabelMethod del = new UpdateLabelMethod(UpdateStatus);
                this.Invoke(del, new object[] { text, error });
            }
            else
            {
                this.label1.Text = text;

                if (error)
                {
                    label1.ForeColor = Color.Red;
                } else
                {
                    label1.ForeColor = Color.Green;
                }
            }
        }

        private void AddMessage(string text)
        {
            if (this.listBox1.InvokeRequired)
            {
                UpdateMessagesMethod del = new UpdateMessagesMethod(AddMessage);
                this.Invoke(del, new object[] { text });
            } else
            {
                this.listBox1.Items.Add(text);
                this.listBox1.SelectedIndex = this.listBox1.Items.Count - 1;
            }
        }

        private void sendMessageBtn_Click(object sender, EventArgs e)
        {
            SendMessage();
        }

        private void OnKeyDownHandler(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter && e.Modifiers != Keys.Shift)
            {
                SendMessage();
                e.SuppressKeyPress = true;
            }
        }

        public class MessageDTO
        {
            public string token { get; set; }
            public string message { get; set; }
        }

        public class LoginDTO
        {
            public string email { get; set; }

            public string password { get; set; }
        }

        public class RegisterDTO
        {
            public string username { get; set; }

            public string email { get; set; }

            public string password { get; set; }
        }

        public class ResponseDTO
        {
            public string message { get; set; }

            public string token { get; set; }
        }

        private void SendMessage()
        {
            if (client == null || userMsgTextBox.Text.Length <= 0) return;

            client.EmitAsync("message", new MessageDTO { token = sessionToken, message = userMsgTextBox.Text });
            userMsgTextBox.Text = "";
        }

        private void listBox1_DrawItem(object sender, DrawItemEventArgs e)
        {
            e.DrawBackground();
            e.DrawFocusRectangle();
            try
            {
                e.Graphics.DrawString(listBox1.Items[e.Index].ToString(), e.Font, new SolidBrush(e.ForeColor), e.Bounds);
            } catch {}
        }

        private void listBox1_MeasureItem(object sender, MeasureItemEventArgs e)
        {
            e.ItemHeight = (int)e.Graphics.MeasureString(listBox1.Items[e.Index].ToString(), listBox1.Font, listBox1.Width).Height;
        }

        private void ClearFields()
        {
            registerEmailTextBox.Clear();
            registerPasswordTextBox.Clear();
            registerUsernameTextBox.Clear();
            emailTextBox.Clear();
            passwordTextBox.Clear();
        }

        private void InitializeChat()
        {
            UpdateIpVar();

            socketIoManager();

            sendMessageBtn.Enabled = true;
            userMsgTextBox.Enabled = true;

            registerEmailTextBox.Enabled = false;
            registerPasswordTextBox.Enabled = false;
            registerUsernameTextBox.Enabled = false;
            emailTextBox.Enabled = false;
            passwordTextBox.Enabled = false;
            loginBtn.Enabled = false;
            registerBtn.Enabled = false;
        }

        private async void Login()
        {
            var loginObj = Newtonsoft.Json.JsonConvert.SerializeObject(new LoginDTO { email = emailTextBox.Text, password = passwordTextBox.Text });

            using (var client = new HttpClient())
            {
                var response = await client.PostAsync(
                    $"{serverAddress}/users/login",
                     new StringContent(loginObj, Encoding.UTF8, "application/json"));

                var bodyContents = await response.Content.ReadAsStringAsync();
                var responseObj = Newtonsoft.Json.JsonConvert.DeserializeObject<ResponseDTO>(bodyContents);

                if (responseObj.token != null)
                {
                    sessionTokenLabel.Text = $"session: {responseObj.token}";
                    sessionToken = responseObj.token;
                }

                if (responseObj.message != null)
                {
                    MessageBox.Show(responseObj.message);
                }

                if (response.StatusCode == HttpStatusCode.Created)
                {
                    ClearFields();
                    InitializeChat();
                }
            }
        }

        private void loginBtn_Click(object sender, EventArgs e)
        {
            UpdateIpVar();
            Login();
        }

        private async void Register()
        {
            var registerObj = Newtonsoft.Json.JsonConvert.SerializeObject(new RegisterDTO { username = registerUsernameTextBox.Text, email = registerEmailTextBox.Text, password = registerPasswordTextBox.Text });

            using (var client = new HttpClient())
            {
                var response = await client.PostAsync(
                    $"{serverAddress}/users/register",
                     new StringContent(registerObj, Encoding.UTF8, "application/json"));

                var bodyContents = await response.Content.ReadAsStringAsync();
                var responseObj = Newtonsoft.Json.JsonConvert.DeserializeObject<ResponseDTO>(bodyContents);

                if (responseObj.message != null)
                {
                    MessageBox.Show(responseObj.message);
                }

                if (response.StatusCode == HttpStatusCode.Created)
                {
                    ClearFields();
                }
            }
        }

        private void registerBtn_Click(object sender, EventArgs e)
        {
            UpdateIpVar();
            Register();
        }
    }
}
