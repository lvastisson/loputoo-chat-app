using SocketIOClient;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.UI.WebControls;
using System.Windows.Forms;

namespace frontend_app
{
    public partial class Form1 : Form
    {
        public delegate void UpdateLabelMethod(string text);
        public delegate void UpdateMessagesMethod(string text);

        string serverAddress = "http://localhost:8888/";

        Random rnd = new Random();

        SocketIO client = null;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            userNameTextBox.Text = $"user_{rnd.Next(1111, 9999)}";
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Debug.WriteLine("clicked");

            if (serverIPTextBox.Text != "")
            {
                serverAddress = serverIPTextBox.Text;
            }

            socketIoManager();

            button1.Enabled = false;
            sendMessageBtn.Enabled = true;
        }

        private async void socketIoManager()
        {
            client = new SocketIO(serverAddress);
            Debug.WriteLine("past socket initalization");

            client.OnConnected += async (sender, e) =>
            {
                Debug.WriteLine("ühendatud");
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

        private void UpdateStatus(string text)
        {
            if (this.label1.InvokeRequired)
            {
                UpdateLabelMethod del = new UpdateLabelMethod(UpdateStatus);
                this.Invoke(del, new object[] { text });
            }
            else
            {
                this.label1.Text = text;
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
            if (e.KeyCode == Keys.Enter)
            {
                SendMessage();
            }

        }

        private void SendMessage()
        {
            if (client != null)
            {
                client.EmitAsync("message", $"[{userNameTextBox.Text}] {userMsgTextBox.Text}");
            }

            userMsgTextBox.Text = "";
        }
    }
}
